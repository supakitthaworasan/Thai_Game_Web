import {z} from 'zod'

const addMovieSchema = z.object({
    title: z.string().min(1, 'title is required'),
    overview: z.string().optional(),
    release_year: z.coerce.number().int().min(1888, 'must be over 1887'),
    genres: z.array(z.string()),
    runtime: z.coerce.number().int().positive(),
    poster_url: z.string().url().optional()
});

export {addMovieSchema};