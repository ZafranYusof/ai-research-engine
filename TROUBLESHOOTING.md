# Troubleshooting

## Common Issues

### Semantic Scholar 429 errors
Rate limited. Wait 60 seconds between requests.

### MongoDB connection timeout
Check MONGODB_URI env var and network access in Atlas.

### bcrypt import error on Render
Use passlib with bcrypt backend or hashlib fallback.
