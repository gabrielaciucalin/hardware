# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements and app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose port
EXPOSE 8080

# Run the app
CMD ["gunicorn", "-b", "0.0.0.0:8080", "main:app"]
