import bcrypt

# Generate correct password hashes
passwords = {
    'patient123': bcrypt.hashpw('patient123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
    'doctor123': bcrypt.hashpw('doctor123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
    'pharmacy123': bcrypt.hashpw('pharmacy123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
}

for pwd, hash_val in passwords.items():
    print(f"{pwd}: {hash_val}")

# Test the hash
test_hash = passwords['patient123']
print(f"\nTesting patient123 against its hash:")
print(f"Hash: {test_hash}")
print(f"Verify: {bcrypt.checkpw('patient123'.encode('utf-8'), test_hash.encode('utf-8'))}")