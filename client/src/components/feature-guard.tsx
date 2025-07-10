import { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { Link } from "wouter";
import usePermissions from "@/hooks/use-permissions";
import { FeaturePermissions } from "@shared/permissions";

interface FeatureGuardProps {
  feature: keyof FeaturePermissions;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

export function FeatureGuard({ 
  feature, 
  children, 
  fallback, 
  showUpgradePrompt = true 
}: FeatureGuardProps) {
  const { hasFeature, getPlanInfo } = usePermissions();
  const planInfo = getPlanInfo();
  
  if (hasFeature(feature)) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (!showUpgradePrompt) {
    return null;
  }
  
  return (
    <Alert className="border-orange-200 bg-orange-50">
      <Lock className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-orange-800 font-medium">
            Fitur ini tersedia untuk paket Pro dan Pro Plus
          </p>
          <p className="text-orange-700 text-sm mt-1">
            Upgrade paket berlangganan untuk mengakses fitur ini dan fitur premium lainnya.
          </p>
        </div>
        <Link href="/berlangganan">
          <Button size="sm" className="bg-qasir-red hover:bg-qasir-red/90 text-white ml-4">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}

interface LimitGuardProps {
  limitType: 'maxProducts' | 'maxEmployees' | 'maxOutlets';
  currentCount: number;
  children: ReactNode;
  actionText?: string;
}

export function LimitGuard({ 
  limitType, 
  currentCount, 
  children, 
  actionText = "menambah" 
}: LimitGuardProps) {
  const { checkLimit } = usePermissions();
  const limitCheck = checkLimit(limitType, currentCount);
  
  if (limitCheck.allowed) {
    return <>{children}</>;
  }
  
  const limitTexts = {
    maxProducts: 'produk',
    maxEmployees: 'pegawai', 
    maxOutlets: 'outlet'
  };
  
  return (
    <Alert className="border-orange-200 bg-orange-50">
      <Lock className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-orange-800 font-medium">
            Batas maksimal {limitTexts[limitType]} tercapai
          </p>
          <p className="text-orange-700 text-sm mt-1">
            Anda sudah mencapai batas {limitCheck.limit} {limitTexts[limitType]}. 
            Upgrade ke paket Pro untuk {actionText} lebih banyak {limitTexts[limitType]}.
          </p>
        </div>
        <Link href="/berlangganan">
          <Button size="sm" className="bg-qasir-red hover:bg-qasir-red/90 text-white ml-4">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}

export default FeatureGuard;