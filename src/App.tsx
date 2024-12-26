import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AppProps {
  container: HTMLElement;
}

export function App({ container }: AppProps) {
  console.log(container);
  
  return (
    <main className="@container">
      <div className="w-full h-full flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex flex-1 items-center justify-center rounded-lg shadow-sm" x-chunk="dashboard-02-chunk-1">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">Metadata View</h3>
            <p className="text-sm text-muted-foreground">New Plugin</p>
            <div className="flex flex-row items-center justify-center gap-2">
              <Button
                className="sm:bg-green-800 xl:bg-red-800 3xl:bg-blue-800 hover:bg-primary/90 dark:sm:bg-green-500 dark:xl:bg-red-500 dark:3xl:bg-blue-500 shadow-none"
                onClick={() => {
                  toast('Hello', {
                    description: 'A  toast',
                  });
                }}
              >
                New Notice
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}