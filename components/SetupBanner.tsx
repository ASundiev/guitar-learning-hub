import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Database, ExternalLink, X, ChevronDown, ChevronUp } from 'lucide-react';
import { isConfigured } from '../lib/supabase';

export function SetupBanner() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isConfigured || isDismissed) {
    return null;
  }

  return (
    <Card className="border-orange-500/20 bg-orange-500/5 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Database className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-orange-500">Database Setup Required</h3>
                <p className="text-xs text-muted-foreground">
                  Using temporary local storage. Set up Supabase for persistent data.
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 w-6 p-0 text-orange-500 hover:text-orange-400"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDismissed(true)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {isExpanded && (
              <div className="space-y-3 pt-2 border-t border-orange-500/20">
                <div className="text-xs space-y-2">
                  <p className="text-muted-foreground">
                    Your data is currently stored locally and will be lost on page refresh.
                  </p>
                  <div className="space-y-1">
                    <p className="font-medium text-orange-500">Quick Setup:</p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Create a free account at <span className="text-orange-500">supabase.com</span></li>
                      <li>Create a new project</li>
                      <li>Copy your project URL and API key</li>
                      <li>Update the credentials in <code className="text-xs bg-muted px-1 rounded">/lib/supabase.ts</code></li>
                      <li>Run the SQL schema from <code className="text-xs bg-muted px-1 rounded">/database/schema.sql</code></li>
                    </ol>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild className="h-7 text-xs">
                    <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open Supabase
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}