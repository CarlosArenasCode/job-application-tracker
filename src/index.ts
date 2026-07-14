import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/api/status', (req: Request, res: Response) => {
    res.json({
        status: 'online',
        message: 'Server is running smoothly with TypeScript!'
    });
});

app.listen(PORT, () =>{
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
});