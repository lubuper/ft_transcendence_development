#!/bin/bash

# Get the machine's IP address (assumes eth0 is the network interface)
IP_ADDRESS=$(hostname -I | awk '{print $1}')

# If you prefer to use a custom domain name instead of IP, you can define it manually
DOMAIN_NAME="local.mywebsite.local"  # You can change this

# Path where you want to store the certificates
CERT_DIR="./certs"
CERT_FILE="$CERT_DIR/self_signed_cert.pem"
KEY_FILE="$CERT_DIR/self_signed_key.pem"

# Create the certs directory if it doesn't exist
mkdir -p $CERT_DIR

# Generate a new self-signed certificate using the IP address or domain name
openssl req -x509 -nodes -newkey rsa:2048 -keyout $KEY_FILE -out $CERT_FILE -days 365 \
  -subj "/C=US/ST=State/L=City/O=Company/OU=Department/CN=$IP_ADDRESS"

echo "Self-signed certificate generated for IP: $IP_ADDRESS"
