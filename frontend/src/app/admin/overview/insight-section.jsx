import { Skeleton } from '@/components/ui/skeleton';
import { DURATION_FILTER_OPTIONS } from '@/config/admin.config';
import useQuery from '@/lib/hooks/useQuery';
import API_CONFIG from '@/config/api.config';
import { formatCurrency } from '@/lib/utils';
import dayjs from 'dayjs';
import { useParams, useSearchParams } from 'react-router';

const InsightNotAvailable = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 border rounded-md">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="40"
          width="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.828 14.828 21 21" />
          <path d="M21 16v5h-5" />
          <path d="m21 3-9 9-4-4-6 6" />
          <path d="M21 8V3h-5" />
        </svg>
      </div>
      <p className="text-sm font-medium text-center text-muted-foreground">
        {message || 'No insights available at the moment.'}
      </p>
    </div>
  );
};
const InsightCard = ({ title, insightMetric, pending }) => {
  return (
    <div className="flex flex-col gap-3 p-6 border rounded-md">
      <h3 className="text-sm font-medium">{title}</h3>
      <strong className="font-mono text-4xl font-bold">
        {pending ? <Skeleton className="w-20 h-8" /> : insightMetric}
      </strong>
    </div>
  );
};
const InsightSection = () => {
  const [searchParams] = useSearchParams();
  const { hotelId } = useParams();
  const { data, pending, error } = useQuery({
    url: API_CONFIG.ADMIN.HOTEL_REPORT(hotelId),
    options: {
      params: {
        startDate: dayjs()
          .subtract(
            searchParams.get('duration') ?? DURATION_FILTER_OPTIONS[1].value,
            'days'
          )
          .format('YYYY-MM-DD'),
      },
    },
  });
  if (error) {
    return <InsightNotAvailable message={error} />;
  }
  return (
    <section className="grid mt-8 gap-4 grid-cols-[repeat(auto-fit,_minmax(380px,1fr))]">
      <InsightCard
        title="Confirmed Bookings"
        insightMetric={data?.bookingCount ?? 0}
        pending={pending}
      />
      <InsightCard
        title="Total Revenue"
        insightMetric={formatCurrency(data?.totalRevenue ?? 0)}
        pending={pending}
      />
      <InsightCard
        title="Avg Revenue Per Booking"
        insightMetric={formatCurrency(data?.avgRevenue ?? 0)}
        pending={pending}
      />
    </section>
  );
};

export default InsightSection;
