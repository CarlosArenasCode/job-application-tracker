import express, { Request, Response } from 'express';
import { prisma } from './config/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/status', (req: Request, res: Response) => {
    res.json({ status: 'online', message: 'Server is running smoothly!' });
});

app.get('/api/jobs', async (req: Request, res: Response) => {
    try {
        const jobs = await prisma.jobApplication.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching job applications:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

type JobUpdateBody = {
    company?: string;
    position?: string;
    status?: string;
    url?: string;
    notes?: string;
};

app.patch(
    '/api/jobs/:id',
    async (req: Request<{ id: string }, unknown, JobUpdateBody>, res: Response) => {
        const { id } = req.params;
        const { company, position, status, url, notes } = req.body;

        const updatedJob = await prisma.jobApplication.update({
            where: { id },
            data: {
                company,
                position,
                status,
                url,
                notes,
            },
        });

        res.status(200).json(updatedJob);
    }
);

app.delete('/api/jobs/:id', async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.jobApplication.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting job application:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.post('/api/jobs', async (req: Request, res: Response) =>{
    try {
        const { company, position, status, url, notes } = req.body;

        if (!company || !position) {
            res.status(400).json({ error: 'Company and position are required fields.' });
            return;
        }

        const newJob = await prisma.jobApplication.create({
            data: {
                company,
                position,
                status,
                url,
                notes,
            },
        });

        res.status(201).json(newJob);
    } catch (error) {
        console.error('Error creating job application:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
