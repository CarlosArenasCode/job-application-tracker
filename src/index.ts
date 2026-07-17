import express, { Request, Response } from 'express';
import { prisma } from './config/db.js';
import { ApplicationStatus } from '@prisma/client';
import { z } from 'zod';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const createJobSchema = z.object({
    company: z.string().min(1, 'Company is required.'),
    position: z.string().min(1, 'Position is required.'),
    status: z.nativeEnum(ApplicationStatus).optional(),
    url: z.string().url('Invalid URL format.').nullable().optional(),
    notes: z.string().nullable().optional(),
});

const updateJobSchema = z.object({
    company: z.string().min(1, 'Company cannot be empty.').optional(),
    position: z.string().min(1, 'Position cannot be empty.').optional(),
    status: z.nativeEnum(ApplicationStatus).optional(),
    url: z.string().url('Invalid URL format.').nullable().optional(),
    notes: z.string().nullable().optional(),
});

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

app.patch(
    '/api/jobs/:id',
    async (req: Request<{ id: string }>, res: Response) => {
        try {
            const { id } = req.params;
            const result = updateJobSchema.safeParse(req.body);

            if (!result.success) {
                res.status(400).json({ error: result.error.flatten().fieldErrors });
                return;
            }

            const updatedJob = await prisma.jobApplication.update({
                where: { id },
                data: result.data,
            });

            res.status(200).json(updatedJob);
        } catch (error) {
            console.error('Error updating job application:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
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

app.post('/api/jobs', async (req: Request, res: Response) => {
    try {
        const result = createJobSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({ error: result.error.flatten().fieldErrors });
            return;
        }

        const newJob = await prisma.jobApplication.create({
            data: result.data,
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

