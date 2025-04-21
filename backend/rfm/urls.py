from django.urls import path
from .views import TransactionUploadView, RFMAnalysisView, CustomerRankingView, UploadedFileListView, UploadedFileDownloadView
from .analytics_endpoints import RevenueAnalyticsView, CustomerAnalyticsView, VIPCustomersView, AvgOrderValueView

app_name = 'rfm'

urlpatterns = [
    path('upload/', TransactionUploadView.as_view(), name='transaction_upload'),
    path('uploaded-files/', UploadedFileListView.as_view(), name='uploaded_file_list'),
    path('uploaded-files/<int:file_id>/download/', UploadedFileDownloadView.as_view(), name='uploaded_file_download'),
    path('analysis/', RFMAnalysisView.as_view(), name='rfm_analysis'),
    path('ranking/', CustomerRankingView.as_view(), name='customer_ranking'),
    path('analytics/revenue/', RevenueAnalyticsView.as_view(), name='revenue_analytics'),
    path('analytics/customers/', CustomerAnalyticsView.as_view(), name='customer_analytics'),
    path('analytics/vip/', VIPCustomersView.as_view(), name='vip_customers'),
    path('analytics/avg-order-value/', AvgOrderValueView.as_view(), name='avg_order_value'),
]

