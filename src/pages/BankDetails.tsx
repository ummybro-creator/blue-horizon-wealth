import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useBankDetails, useSaveBankDetails } from '@/hooks/useBankDetails';

const BankDetails = () => {
  const navigate = useNavigate();
  const { data: bankDetails, isLoading } = useBankDetails();
  const saveBankDetails = useSaveBankDetails();
  
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');

  // Initialize form with existing data
  useState(() => {
    if (bankDetails) {
      setAccountHolderName(bankDetails.account_holder_name || '');
      setBankName(bankDetails.bank_name || '');
      setAccountNumber(bankDetails.account_number || '');
      setIfscCode(bankDetails.ifsc_code || '');
      setUpiId(bankDetails.upi_id || '');
    }
  });

  const handleSubmit = async () => {
    if (!accountHolderName.trim()) {
      toast.error('Please enter account holder name');
      return;
    }
    
    if (!bankName.trim() && !upiId.trim()) {
      toast.error('Please enter bank details or UPI ID');
      return;
    }
    
    if (bankName.trim() && (!accountNumber.trim() || !ifscCode.trim())) {
      toast.error('Please enter complete bank details');
      return;
    }

    try {
      await saveBankDetails.mutateAsync({
        account_holder_name: accountHolderName,
        bank_name: bankName,
        account_number: accountNumber,
        ifsc_code: ifscCode,
        upi_id: upiId,
      });
      
      toast.success('Bank details saved successfully!');
      navigate(-1);
    } catch (error) {
      toast.error('Failed to save bank details');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Header */}
      <div className="gradient-header pt-12 pb-6 px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Bank Details</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Bank Details Card */}
        <div className="bg-card rounded-2xl shadow-card p-5 space-y-4">
          <h3 className="font-semibold text-foreground mb-4">Enter Bank Details</h3>
          
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Account Holder Name</label>
            <Input
              type="text"
              placeholder="Enter name as per bank account"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              className="h-12"
            />
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Bank Name</label>
            <Input
              type="text"
              placeholder="Enter bank name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="h-12"
            />
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Account Number</label>
            <Input
              type="text"
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="h-12"
            />
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">IFSC Code</label>
            <Input
              type="text"
              placeholder="Enter IFSC code"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              className="h-12"
            />
          </div>
        </div>

        {/* OR Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground text-sm">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* UPI Details */}
        <div className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="font-semibold text-foreground mb-4">UPI Details</h3>
          
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">UPI ID</label>
            <Input
              type="text"
              placeholder="Enter UPI ID (e.g., name@upi)"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          variant="gradient" 
          size="xl" 
          className="w-full"
          onClick={handleSubmit}
          disabled={saveBankDetails.isPending}
        >
          <Save className="w-5 h-5 mr-2" />
          {saveBankDetails.isPending ? 'Saving...' : 'Save Bank Details'}
        </Button>
      </div>
    </div>
  );
};

export default BankDetails;
