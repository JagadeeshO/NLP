from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import joblib
import io
import os

app = Flask(__name__, static_folder='frontend/dist', static_url_path='')

CORS(app)

# Load the sentiment analysis model
model = joblib.load("senti_lr.pkl")

# API Routes - must be defined BEFORE catch-all
@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Read the CSV file
        df = pd.read_csv(file)
        
        # Validate columns
        required_cols = ['product_name', 'review']
        if not all(col in df.columns for col in required_cols):
            return jsonify({'error': f'CSV must contain columns: {required_cols}'}), 400
        
        # Predict sentiment
        df['predicted_sentiment'] = model.predict(df['review'].astype(str))
        
        # Map numeric labels to text
        sentiment_map = {0: 'Negative', 1: 'Positive'}
        df['sentiment_label'] = df['predicted_sentiment'].map(sentiment_map)
        
        # Calculate sentiment distribution
        sentiment_counts = df['sentiment_label'].value_counts().to_dict()
        
        # Calculate top products by positive sentiment
        top_products = (
            df.groupby('product_name')['predicted_sentiment']
            .mean()
            .sort_values(ascending=False)
            .head(10)
            .to_dict()
        )
        
        # Get sample predictions
        sample_data = df[['product_name', 'review', 'sentiment_label']].head(20).to_dict('records')
        
        return jsonify({
            'success': True,
            'sentiment_distribution': sentiment_counts,
            'top_products': top_products,
            'sample_predictions': sample_data,
            'total_reviews': len(df)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})

# Serve React App - catch-all route at the END
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
