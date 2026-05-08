#!/bin/bash
# Generates RSA key pair for JWT RS256 signing
# Run this once before starting the project

KEYS_DIR_AUTH="auth-service/src/main/resources/keys"
KEYS_DIR_GATEWAY="api-gateway/src/main/resources/keys"

mkdir -p "$KEYS_DIR_AUTH" "$KEYS_DIR_GATEWAY"

# Generate private key (PKCS8)
openssl genrsa -out private_raw.pem 2048
openssl pkcs8 -topk8 -inform PEM -in private_raw.pem -out "$KEYS_DIR_AUTH/private.pem" -nocrypt
rm private_raw.pem

# Extract public key
openssl rsa -in "$KEYS_DIR_AUTH/private.pem" -pubout -out "$KEYS_DIR_AUTH/public.pem"

# Copy public key to gateway (gateway only needs public key to verify)
cp "$KEYS_DIR_AUTH/public.pem" "$KEYS_DIR_GATEWAY/public.pem"

echo "✅ RSA keys generated:"
echo "  Private key: $KEYS_DIR_AUTH/private.pem (auth-service only)"
echo "  Public key:  $KEYS_DIR_AUTH/public.pem + $KEYS_DIR_GATEWAY/public.pem"
echo ""
