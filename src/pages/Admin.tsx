import React, { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useGetAdminStats, useAdminWithdraw } from "../lib/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { address, isConnected } = useWallet();
  const { toast } = useToast();
  const DEPLOYER_ADDRESS = import.meta.env.VITE_DEPLOYER_ADDRESS || "";

  const isDeployer = isConnected && address?.toLowerCase() === DEPLOYER_ADDRESS.toLowerCase();

  const { data: stats, refetch } = useGetAdminStats(
    { deployerAddress: address || "" },
    { query: { enabled: isDeployer } }
  );

  const withdraw = useAdminWithdraw();
  const [destination, setDestination] = useState("");

  if (!isDeployer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground font-mono">
        Nothing to see here.
      </div>
    );
  }

  const handleWithdraw = () => {
    if (!address || !destination) return;
    withdraw.mutate({
      data: {
        deployerAddress: address,
        destinationAddress: destination,
        signature: "fake-sig"
      }
    }, {
      onSuccess: () => {
        toast({ title: "Withdrawal successful" });
        setDestination("");
        refetch();
      },
      onError: () => {
        toast({ title: "Withdrawal failed", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <h1 className="text-3xl font-bold text-primary mb-8 tracking-tighter">OVERSEER TERMINAL</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle>System Statistics</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-sm space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Fees (PROS)</span>
              <span className="text-foreground">{stats?.totalFeesCollectedPros}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Presale Raised (PROS)</span>
              <span className="text-foreground">{stats?.totalPresaleRaisedPros}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Miners</span>
              <span className="text-foreground">{stats?.totalMiners}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Presale Participants</span>
              <span className="text-foreground">{stats?.totalPresaleParticipants}</span>
            </div>
            <div className="flex justify-between border-t border-border/50 pt-2">
              <span className="text-primary font-bold">Pending Withdrawal</span>
              <span className="text-primary font-bold">{stats?.pendingWithdrawalPros} PROS</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Withdrawal Protocol</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase">Destination Address</label>
              <Input 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="0x..."
                className="font-mono bg-background/50"
              />
            </div>
            <Button 
              onClick={handleWithdraw}
              disabled={withdraw.isPending || !destination}
              className="w-full font-mono uppercase bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {withdraw.isPending ? "Executing..." : "Execute Withdrawal"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
