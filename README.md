(currently the work is in process)
# Vidtube

Vidtube is a video-sharing platform that allows users to upload, watch, and manage videos with an intuitive and user-friendly interface.

## Features
- 📹 **Upload & Manage Videos** - Users can upload videos and manage their content.
- 🎞 **Watch History** - Keep track of watched videos.
- 👤 **User Profiles** - Manage user data and preferences.
- 🚀 **Health Check API** - Ensures the system is running smoothly.

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pushparajwastaken/Vidtube.git
   cd Vidtube
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up environment variables**
   - Create a `.env` file in the root directory.
   - Add necessary configurations (e.g., database URL, API keys).

4. **Run the application**
   ```bash
   npm start
   ```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns the status of the application.

### User Profile
```
GET /api/user/profile
```
Fetches user profile information.

```
GET /api/user/watch-history
```
Retrieves the user's video watch history.

## Contributing
Pull requests are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

---

### **Note:** Ensure that `.env` is added to `.gitignore` to protect sensitive data.

