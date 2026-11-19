from django.conf import settings
from django.core.mail import send_mail
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.response import Response

from .models import CakeOrder, ShopCategory, ShopItem
from .serializers import (
    CakeOrderQuoteSerializer,
    CakeOrderSerializer,
    CakeOrderStatusSerializer,
    ShopCategorySerializer,
    ShopItemSerializer,
)


# Custom permission for product and category management
class IsShopAdminOrReadOnly(BasePermission):

    def has_permission(self, request, view):

        # Allow everyone to view products and categories
        if request.method in SAFE_METHODS:
            return True

        user = request.user

        # Only superusers and approved administrators can make changes
        return bool(
            user.is_authenticated
            and user.is_active
            and (
                user.is_superuser
                or (getattr(user, 'role', None) == 'admin' and getattr(user, 'is_approved', False))
            )
        )


class IsShopStaff(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and (
                user.is_superuser
                or (
                    getattr(user, 'role', None) in ['admin', 'agent']
                    and getattr(user, 'is_approved', False)
                )
            )
        )


class ShopCategoryViewSet(viewsets.ModelViewSet):
    queryset = ShopCategory.objects.all()
    serializer_class = ShopCategorySerializer
    permission_classes = [IsShopAdminOrReadOnly]


class ShopItemViewSet(viewsets.ModelViewSet):
    queryset = ShopItem.objects.all()
    serializer_class = ShopItemSerializer
    permission_classes = [IsShopAdminOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        """Handle file uploads with detailed logging"""

        print("\n" + "=" * 50)
        print("RECEIVED REQUEST DATA:")
        print(f"Content-Type: {request.content_type}")
        print(f"Data keys: {list(request.data.keys())}")

        if 'image' in request.FILES:
            print(f"Image received: {request.FILES['image'].name}")
            print(f"Size: {request.FILES['image'].size} bytes")
        else:
            print("No image file received")

        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)

            print("Item created successfully")
            print("=" * 50 + "\n")

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )

        print("Serializer errors:")
        print(serializer.errors)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


def _is_staff_user(user):
    return bool(
        user
        and user.is_authenticated
        and user.is_active
        and (
            user.is_superuser
            or (
                getattr(user, 'role', None) in ['admin', 'agent']
                and getattr(user, 'is_approved', False)
            )
        )
    )


def _format_order_items(order):
    lines = []
    for item in order.items.all():
        base = f"- {item.quantity} x {item.cake_name}"
        if item.base_price is not None:
            base += f" (base: UGX {item.base_price})"
        edits = (item.custom_edits or '').strip() or 'None'
        lines.append(f"{base}\n  Custom edits: {edits}")
    return "\n".join(lines) if lines else "- No items"


def _send_new_order_email(order):
    staff_email = getattr(settings, 'STAFF_NOTIFICATION_EMAIL', None) or settings.DEFAULT_FROM_EMAIL
    subject = f"New Cake Order #{order.id} - Quote Requested"
    body = (
        f"A new cake order has been placed and needs a price quote.\n\n"
        f"Order ID: #{order.id}\n"
        f"Customer: {order.customer_name}\n"
        f"Phone: {order.customer_phone}\n"
        f"Email: {order.customer_email or 'N/A'}\n"
        f"Delivery address: {order.delivery_address or 'N/A'}\n"
        f"Payment method: {order.payment_method or 'N/A'}\n"
        f"Status: {order.get_status_display()}\n\n"
        f"Items and custom edits:\n{_format_order_items(order)}\n\n"
        f"Please review this order in the staff dashboard and submit a quoted price."
    )
    send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [staff_email], fail_silently=False)


def _send_quote_email(order):
    if not order.customer_email:
        return False
    subject = f"Price Quote for Your Cake Order #{order.id}"
    quote_message = (order.quote_message or '').strip()
    message_block = f"\nMessage from staff: {quote_message}\n" if quote_message else ""
    body = (
        f"Hello {order.customer_name},\n\n"
        f"Your cake order #{order.id} has been reviewed.\n"
        f"Quoted price: UGX {order.quoted_price}\n"
        f"{message_block}\n"
        f"Order details:\n{_format_order_items(order)}\n\n"
        f"Please log in to your profile/orders page to approve or reject this quote so we can proceed."
    )
    send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [order.customer_email], fail_silently=False)
    return True


class CakeOrderViewSet(viewsets.ModelViewSet):
    queryset = CakeOrder.objects.prefetch_related('items').all()
    serializer_class = CakeOrderSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def get_permissions(self):
        if self.action == 'create':
            return []
        if self.action in ['list', 'retrieve', 'quote']:
            # further restricted in queryset/object checks and action logic
            return []
        if self.action == 'respond':
            return []
        return [IsShopStaff()]

    def get_queryset(self):
        qs = CakeOrder.objects.prefetch_related('items').all().order_by('-created_at')
        user = self.request.user
        if _is_staff_user(user):
            return qs
        if user.is_authenticated:
            return qs.filter(customer=user)
        return qs.none()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        try:
            _send_new_order_email(order)
        except Exception as exc:
            # Order is saved; report email issue but don't lose the order
            print(f"Failed to send staff order email for order #{order.id}: {exc}")
        headers = self.get_success_headers(serializer.data)
        return Response(self.get_serializer(order).data, status=status.HTTP_201_CREATED, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        order = self.get_object()
        user = request.user
        if not _is_staff_user(user):
            if not (user.is_authenticated and order.customer_id == user.id):
                return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='quote')
    def quote(self, request, pk=None):
        if not _is_staff_user(request.user):
            return Response({'detail': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

        order = CakeOrder.objects.prefetch_related('items').get(pk=pk)
        if order.status not in [CakeOrder.STATUS_PENDING_QUOTE, CakeOrder.STATUS_QUOTED]:
            return Response({'detail': 'Only pending or previously quoted orders can be quoted.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CakeOrderQuoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order.quoted_price = serializer.validated_data['quoted_price']
        order.quote_message = serializer.validated_data.get('quote_message', '')
        order.status = CakeOrder.STATUS_QUOTED
        order.save(update_fields=['quoted_price', 'quote_message', 'status', 'updated_at'])

        email_sent = False
        email_error = None
        try:
            email_sent = _send_quote_email(order)
        except Exception as exc:
            email_error = str(exc)
            print(f"Failed to send quote email for order #{order.id}: {exc}")

        data = self.get_serializer(order).data
        data['quote_email_sent'] = email_sent
        if email_error:
            data['quote_email_error'] = 'Quote saved, but the email could not be sent.'
        if not order.customer_email:
            data['quote_email_warning'] = 'No customer email on file; quote was saved but not emailed.'
        return Response(data)

    @action(detail=True, methods=['post'], url_path='respond')
    def respond(self, request, pk=None):
        order = self.get_object()
        user = request.user
        if not (user.is_authenticated and order.customer_id == user.id):
            return Response({'detail': 'You do not have permission to respond to this order.'}, status=status.HTTP_403_FORBIDDEN)
        if order.status != CakeOrder.STATUS_QUOTED:
            return Response({'detail': 'Only quoted orders can be approved or rejected.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CakeOrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action_value = serializer.validated_data['action']
        if action_value == 'approve':
            order.status = CakeOrder.STATUS_APPROVED
        else:
            order.status = CakeOrder.STATUS_REJECTED
        order.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(order).data)