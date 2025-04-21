import pandas as pd
from django.utils import timezone
from .models import Transaction
from django.db.models import Max, Count, Sum
from datetime import date

def calculate_rfm(user):
    """
    Calculates RFM scores and segments for a given user's transactions.

    Args:
        user: The User object for whom to calculate RFM.

    Returns:
        A pandas DataFrame with columns:
        customer_id, recency, frequency, monetary,
        r_score, f_score, m_score, rfm_score, segment
        Returns None if the user has no transactions.
    """
    transactions = Transaction.objects.filter(user=user)
    if not transactions.exists():
        return None

    # Convert transactions QuerySet to DataFrame, include city for ranking
    df = pd.DataFrame.from_records(
        transactions.values('customer_id', 'purchase_date', 'amount', 'city')
    )
    # Convert amount to numeric if it's not already (it should be Decimal)
    df['amount'] = pd.to_numeric(df['amount'])
    # Ensure purchase_date is parsed as datetime before using .dt accessor
    df['purchase_date'] = pd.to_datetime(df['purchase_date'], errors='coerce')
    df = df.dropna(subset=['purchase_date'])
    # Do NOT convert to .dt.date here, keep as datetime for .dt operations later
    # df['purchase_date'] = df['purchase_date'].dt.date

    # --- Calculate Recency, Frequency, Monetary ---
    # Use a consistent snapshot date for calculations (today)
    snapshot_date = pd.Timestamp(timezone.now().date())

    # Aggregate data per customer
    rfm_df = df.groupby('customer_id').agg(
        last_purchase_date=pd.NamedAgg(column='purchase_date', aggfunc='max'),
        frequency=pd.NamedAgg(column='purchase_date', aggfunc='nunique'), # Count unique purchase days
        monetary=pd.NamedAgg(column='amount', aggfunc='sum')
    ).reset_index()

    # Calculate Recency (days since last purchase)
    # Ensure last_purchase_date is datetime
    rfm_df['last_purchase_date'] = pd.to_datetime(rfm_df['last_purchase_date'], errors='coerce')
    rfm_df['recency'] = (snapshot_date - rfm_df['last_purchase_date']).dt.days

    # Drop the intermediate last_purchase_date column
    rfm_df = rfm_df.drop(columns=['last_purchase_date'])

    # --- Calculate RFM Scores (using quantiles, 1-5 scale) ---
    # Handle cases with fewer than 5 unique values gracefully for qcut
    try:
        # Lower recency is better -> score higher
        rfm_df['r_score'] = pd.qcut(rfm_df['recency'], 5, labels=[5, 4, 3, 2, 1], duplicates='drop').astype(int)
    except ValueError: # Handle cases where qcut fails (e.g., all values are the same)
         rfm_df['r_score'] = 1 # Assign a default score

    try:
        # Higher frequency is better -> score higher
        rfm_df['f_score'] = pd.qcut(rfm_df['frequency'].rank(method='first'), 5, labels=[1, 2, 3, 4, 5], duplicates='drop').astype(int)
    except ValueError:
         rfm_df['f_score'] = 1

    try:
        # Higher monetary is better -> score higher
        rfm_df['m_score'] = pd.qcut(rfm_df['monetary'].rank(method='first'), 5, labels=[1, 2, 3, 4, 5], duplicates='drop').astype(int)
    except ValueError:
         rfm_df['m_score'] = 1


    # Combine scores into a single RFM score string
    rfm_df['rfm_score'] = rfm_df['r_score'].astype(str) + rfm_df['f_score'].astype(str) + rfm_df['m_score'].astype(str)

    # --- Define Segmentation Logic ---
    # This is a common segmentation approach, can be customized
    segment_map = {
        r'[1-2][1-2]': 'Hibernating',
        r'[1-2][3-4]': 'Least Thrift Shopper',
        r'[1-2]5': 'Cannot Lose Them',
        r'3[1-2]': 'About To Sleep',
        r'33': 'Need Attention',
        r'[3-4][4-5]': 'Super Loyal Customers',
        r'41': 'Promising',
        r'51': 'New Customers',
        r'[4-5][2-3]': 'Potential Loyalists',
        r'5[4-5]': 'Super Loyal Customers' # Combined 54 and 55
    }

    # Apply segmentation using regex matching on the combined R and F scores
    # More robust than exact RFM score matching
    rfm_df['segment'] = 'Other' # Default segment
    rfm_df['rf_score'] = rfm_df['r_score'].astype(str) + rfm_df['f_score'].astype(str)

    for pattern, segment in segment_map.items():
         # Use regex=True for pattern matching
        rfm_df.loc[rfm_df['rf_score'].str.match(pattern), 'segment'] = segment

    # Drop the intermediate rf_score column
    rfm_df = rfm_df.drop(columns=['rf_score'])

    # If loyalty points are present in the transactions, sum them per customer and merge into rfm_df
    if 'loyalty_points' in df.columns:
        loyalty_points_df = df.groupby('customer_id')['loyalty_points'].sum().reset_index()
        rfm_df = pd.merge(rfm_df, loyalty_points_df, on='customer_id', how='left')
    else:
        rfm_df['loyalty_points'] = 0

    # Reorder columns for clarity
    rfm_df = rfm_df[['customer_id', 'recency', 'frequency', 'monetary', 'r_score', 'f_score', 'm_score', 'rfm_score', 'segment', 'loyalty_points']]

    return rfm_df
