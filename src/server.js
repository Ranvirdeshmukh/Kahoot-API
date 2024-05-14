import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import mongoose from 'mongoose';
import routes from './routes';

// Initialize the Express application
const app = express();

// Enable CORS if necessary
app.use(cors());

// Enable HTTP request logging
app.use(morgan('dev'));

// Set the view engine to ejs if using templating
app.set('view engine', 'ejs');

// Serve static assets from the 'static' folder
app.use(express.static('static'));

// Set the views directory
app.set('views', path.join(__dirname, '../src/views'));

// Enable URL-encoded data and JSON data parsing in request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Apply routes
app.use('', routes);

// Start the server asynchronously
async function startServer() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/kahootAPI';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Mongoose connected to: ${mongoURI}`);

    // Start listening on the configured port
    const port = process.env.PORT || 9090;
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB and start server:', error);
  }
}

// Call the startServer function to launch the app
startServer();
