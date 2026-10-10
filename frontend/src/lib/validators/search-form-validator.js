import {z} from 'zod'

const searchFormSchema = z.object({
  city: z.string().nonempty(),
  bookingDates: z.object({
    from: z.date(),
    to: z.date(),
  }),
  roomsCount: z.number().min(1).max(10),
});

export {searchFormSchema};
