
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NotFound: React.FC = () => {
  const { toast } = useToast();

  const handleRefresh = () => {
    toast({
      title: "Refreshing page",
      description: "Attempting to reload the application..."
    });
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="glass rounded-xl p-8 text-center max-w-md border shadow-lg">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-6">Oops! The page you're looking for isn't here.</p>
        <p className="text-muted-foreground mb-8">
          It looks like you've ventured into uncharted territory. Let's get you back on track.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="bg-primary hover:bg-primary/90 w-full">
              <Home className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
