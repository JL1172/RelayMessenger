# End-to-End Encrypted Terminal-Based Messenger

## Project Description

This project is a hobby end-to-end encryption terminal-based messenger. It utilizes a WebSocket server as a relay for client-side encrypted messages. The encryption process is a symmetric key process that utilizes a set of RSA keys. This messenger ensures that messages remain private and secure between users, leveraging robust encryption methodologies.

## Tech Stack

- **Node.js**: Server runtime environment.
- **WebSocket Library**: For establishing and handling WebSocket connections.
- **readline-sync**: For handling terminal prompts.
- **chalk**: For styling terminal output.
- **Multiple Modules**: Various Node.js modules to support encryption and utility functions.

## Features

- End-to-end encryption of messages.
- Secure WebSocket-based communication.
- User-friendly terminal interface.
- Symmetric key encryption with RSA key exchange.

## How to use:

In order to interact with the main server an api key is needed and I am limiting right due to costs.

## How It Works

### RSA Encryption

RSA (Rivest-Shamir-Adleman) is a public-key encryption algorithm widely used for secure data transmission. It involves two keys: a public key, which can be shared with everyone, and a private key, which is kept secret.

#### Steps of RSA Encryption:

1. **Key Generation**:

   - Two large prime numbers are selected.
   - Compute `n` as the product of these primes.
   - Compute the totient function, φ(n).
   - Select an integer `e` (public exponent) such that 1 < `e` < φ(n) and `e` is coprime with φ(n).
   - Compute `d` (private exponent) such that `d` ≡ `e⁻¹ (mod φ(n))`.
   - Public key: (e, n), Private key: (d, n).

2. **Encryption**:

   - A plaintext message `M` is converted to an integer `m` such that 0 ≤ `m` < `n`.
   - Ciphertext `c` is computed as `c ≡ m^e (mod n)`.

3. **Decryption**:
   - The ciphertext `c` is decrypted using the private key `d` to obtain `m` by `m ≡ c^d (mod n)`.
   - Convert `m` back to the plaintext message `M`.

### End-to-End Encryption

End-to-end encryption (E2EE) ensures that data being transmitted between two parties is encrypted in such a way that only the communicating users can decrypt and read the messages. No intermediaries, including service providers, can access the decrypted content.

#### How E2EE Works:

1. **Encryption at Sender**:

   - The sender encrypts the message using a symmetric key.
   - The symmetric key is encrypted with the recipient’s public RSA key.

2. **Transmission**:

   - The encrypted message and the encrypted symmetric key are sent to the recipient via the WebSocket server.

3. **Decryption at Receiver**:
   - The recipient decrypts the symmetric key using their private RSA key.
   - The recipient then uses the symmetric key to decrypt the message.

## Contributing

1. Fork the repository.
2. Create a new branch (git checkout -b feature-branch).
3. Make your changes.
4. Commit your changes (git commit -m 'Add new feature').
5. Push to the branch (git push origin feature-branch).
6. Open a pull request.

## I am using a hybrid symmetric key encryption process with AES and RSA due to modulus length issues, here is the description:

- Generate a random symmetric key (e.g., AES key).
- Encrypt the message with the symmetric key using a symmetric encryption algorithm (e.g., AES).
- Encrypt the symmetric key with the recipient's public RSA key.
- Send both the encrypted message and the encrypted symmetric key to the recipient.
- The recipient decrypts the symmetric key using their private RSA key.
- The recipient decrypts the message using the decrypted symmetric key.
