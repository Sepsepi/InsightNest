from rest_framework import serializers

class FileUploadSerializer(serializers.Serializer):
    """
    Serializer for validating file uploads.
    Ensures a file is included in the request.
    """
    file = serializers.FileField(required=True)


class RFMScoreSerializer(serializers.Serializer):
    """
    Serializer for representing calculated RFM scores and segments for a customer.
    Used to structure the output of the RFM analysis endpoint.
    Note: This is not a ModelSerializer as the data is calculated on the fly.
    """
    customer_id = serializers.CharField()
    recency = serializers.IntegerField()
    frequency = serializers.IntegerField()
    monetary = serializers.DecimalField(max_digits=10, decimal_places=2)
    r_score = serializers.IntegerField()
    f_score = serializers.IntegerField()
    m_score = serializers.IntegerField()
    rfm_score = serializers.CharField() # e.g., "555"
    segment = serializers.CharField() # e.g., "Champions", "At Risk"
