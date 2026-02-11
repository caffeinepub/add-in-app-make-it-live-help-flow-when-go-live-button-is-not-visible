import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Rocket, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function PublishHelpPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({ to: '/' });
  };

  const handleHome = () => {
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={handleHome}
            className="text-white border-white/20 hover:bg-white/10"
          >
            <Home className="mr-2 h-5 w-5" />
            Go to Home
          </Button>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full">
                <Rocket className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Make Your App Live
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Follow these steps to publish your FanForge app permanently
            </p>
          </div>

          {/* Important Notice */}
          <Card className="bg-yellow-500/10 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-400">
                <AlertCircle className="mr-2 h-5 w-5" />
                Important: Draft vs. Live
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/90">
              <p className="mb-2">
                <strong>Draft versions expire</strong> after a period of inactivity. To keep your app accessible permanently, you must publish it using the <strong>Go Live</strong> button in the chat interface.
              </p>
              <p>
                Only published apps remain live indefinitely. Rebuilding creates a new draft that will also expire unless published.
              </p>
            </CardContent>
          </Card>

          {/* Step-by-Step Instructions */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">How to Find the "Go Live" Button</CardTitle>
              <CardDescription className="text-white/70">
                The publish button is located in the Caffeine chat interface, not inside your app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-white/90">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Look in the Chat Interface</h3>
                    <p className="text-white/80">
                      The <strong>Go Live</strong> or <strong>Publish</strong> button appears in the Caffeine chat interface where you've been talking to the AI assistant — not inside your FanForge app preview.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Check Below the Messages</h3>
                    <p className="text-white/80">
                      Scroll down in the chat to find the action bar. The button typically appears below the conversation messages, alongside options like <strong>Preview</strong> and <strong>Rebuild</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Click "Go Live" or "Publish"</h3>
                    <p className="text-white/80">
                      Once you find the button, click it to deploy your app permanently. The live version will remain accessible and won't expire.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Troubleshooting: Can't Find the Button?</CardTitle>
              <CardDescription className="text-white/70">
                Try these solutions if the Go Live button isn't visible
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Scroll down in the chat:</strong> The button may be below the visible area. Scroll to the bottom of the chat interface.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Try a different browser:</strong> Some browsers or extensions may hide UI elements. Try Chrome, Firefox, or Safari.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Disable ad blockers or extensions:</strong> Browser extensions can sometimes interfere with UI elements. Temporarily disable them and refresh.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Zoom out your browser:</strong> If your browser zoom is set above 100%, try zooming out (Ctrl/Cmd + minus) to reveal hidden UI elements.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Check your screen size:</strong> On smaller screens, the button might be in a collapsed menu. Look for a menu icon (☰) or "More" button.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rebuild Explanation */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <RefreshCw className="mr-2 h-5 w-5" />
                About Rebuilding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-white/90">
              <p>
                When you request to <strong>"create a new one"</strong> or <strong>"rebuild"</strong>, the system generates a new draft version of your app with the latest code.
              </p>
              <p className="text-yellow-400 font-semibold">
                ⚠️ Important: Rebuilt drafts also expire unless published!
              </p>
              <p>
                After rebuilding, you still need to click the <strong>Go Live</strong> button in the chat interface to make the new version permanent. Rebuilding alone does not publish your app.
              </p>
            </CardContent>
          </Card>

          {/* What Happens After Publishing */}
          <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center text-green-400">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                What Happens After Publishing?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-white/90">
              <p>
                Once you click <strong>Go Live</strong>:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your app is deployed permanently to the Internet Computer</li>
                <li>It receives a permanent URL that never expires</li>
                <li>Users can access it anytime without interruption</li>
                <li>You can continue making updates in draft mode and publish new versions later</li>
              </ul>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              size="lg"
              onClick={handleHome}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
            >
              <Home className="mr-2 h-5 w-5" />
              Return to Home
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10 text-center text-white/60 text-sm">
          <p>
            Need more help? Return to the chat interface and ask the AI assistant for guidance.
          </p>
        </footer>
      </div>
    </div>
  );
}
