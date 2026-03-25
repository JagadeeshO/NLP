import streamlit as st
import pandas as pd
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

# -------------------------------
# Load Model
# -------------------------------
@st.cache_resource
def load_model():
    return joblib.load("senti_lr.pkl")

model = load_model()

# -------------------------------
# Streamlit UI
# -------------------------------
st.set_page_config(page_title="🛍️ Product Review Sentiment Dashboard", layout="wide")
sns.set_style("whitegrid")
sns.set_palette("pastel")

st.title("🛍️ Product Review Sentiment Analyzer")
st.markdown("Upload a CSV with **product_name** and **review** columns to analyze sentiments.")

uploaded_file = st.file_uploader("📂 Upload your CSV file", type=["csv"])

if uploaded_file is not None:
    # Read CSV
    df = pd.read_csv(uploaded_file)

    # Validate columns
    required_cols = ['product_name', 'review']
    if not all(col in df.columns for col in required_cols):
        st.error(f"CSV must contain columns: {required_cols}")
    else:
        st.success("✅ File uploaded successfully!")

        # Predict Sentiment
        df['predicted_sentiment'] = model.predict(df['review'].astype(str))

        # Map numeric labels to text
        sentiment_map = {0: 'Negative', 1: 'Positive'}
        df['sentiment_label'] = df['predicted_sentiment'].map(sentiment_map)

        # -------------------------------
        # Layout (Two columns)
        # -------------------------------
        col1, col2 = st.columns(2)

        with col1:
            st.subheader("📊 Sentiment Distribution")
            sentiment_counts = df['sentiment_label'].value_counts().reset_index()
            sentiment_counts.columns = ['Sentiment', 'Count']

            fig1, ax1 = plt.subplots(figsize=(4, 4))
            wedges, texts, autotexts = ax1.pie(
                sentiment_counts['Count'],
                labels=sentiment_counts['Sentiment'],
                autopct='%1.1f%%',
                startangle=90,
                colors=sns.color_palette("Set2", len(sentiment_counts))
            )
            plt.setp(autotexts, size=10, weight="bold")
            ax1.set_title("Overall Sentiment Share", fontsize=12)
            st.pyplot(fig1)

        with col2:
            st.subheader("🏆 Top Products by Positive Sentiment")
            top_products = (
                df.groupby('product_name')['predicted_sentiment']
                .mean()
                .sort_values(ascending=False)
                .head(10)
                .reset_index()
            )

            fig2, ax2 = plt.subplots(figsize=(6, 4))
            sns.barplot(
                data=top_products,
                x='predicted_sentiment',
                y='product_name',
                ax=ax2,
                palette="viridis"
            )
            ax2.set_xlabel("Average Positive Sentiment", fontsize=10)
            ax2.set_ylabel("")
            ax2.set_title("Top 10 Products by Sentiment", fontsize=12)
            st.pyplot(fig2)

        # -------------------------------
        # Display Data Preview
        # -------------------------------
        st.subheader("🔍 Sample Predictions")
        st.dataframe(
            df[['product_name', 'review', 'sentiment_label']].head(10),
            use_container_width=True,
            height=250
        )

else:
    st.info("👆 Please upload a CSV file to get started.")
