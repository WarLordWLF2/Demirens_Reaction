import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus,
  Trash2,
  Minus,
  Package,
  User,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Building
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

function AddAmenityRequestModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  notificationRefreshTrigger,
  setNotificationRefreshTrigger,
  selectedBookingRoomFromNavigation 
}) {
  // Modal state
  const [availableCharges, setAvailableCharges] = useState([]);
  const [selectedBookingRoom, setSelectedBookingRoom] = useState(null);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [currentAmenity, setCurrentAmenity] = useState({
    charges_master_id: '',
    booking_charges_price: '',
    booking_charges_quantity: 1
  });
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [booking_charge_status, setBookingChargeStatus] = useState(1);
  const [loadingAddAmenity, setLoadingAddAmenity] = useState(false);

  const navigate = useNavigate();
  const APIConn = `${localStorage.url}admin.php`;

  const fetchAvailableCharges = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append('method', 'get_available_charges');
      
      console.log('💳 Fetching available charges from:', APIConn);
      const response = await axios.post(APIConn, formData);
      console.log('📋 Available charges API response:', response.data);
      console.log('📊 Number of charges received:', response.data?.length || 0);
      
      setAvailableCharges(response.data || []);
      console.log('✅ Available charges set successfully');
    } catch (error) {
      console.error('❌ Error fetching available charges:', error);
      console.error('📝 Error response:', error.response?.data);
      console.error('📝 Error status:', error.response?.status);
      toast.error('Failed to fetch available charges');
      setAvailableCharges([]);
    }
  }, [APIConn]);

  const handleChargeSelect = (chargeId) => {
    const charge = availableCharges.find(c => c.charges_master_id === parseInt(chargeId));
    setSelectedCharge(charge);
    setCurrentAmenity(prev => ({
      ...prev,
      charges_master_id: chargeId,
      booking_charges_price: charge ? charge.charges_master_price : ''
    }));
  };

  const handleNavigateToBookingRoomSelection = () => {
    navigate('/admin/bookingroomselection');
  };

  const addAmenityToList = () => {
    if (!currentAmenity.charges_master_id || !currentAmenity.booking_charges_price || !currentAmenity.booking_charges_quantity) {
      toast.error('Please fill in all amenity fields');
      return;
    }

    // Check if this amenity is already in the list
    const existingIndex = amenitiesList.findIndex(item => item.charges_master_id === currentAmenity.charges_master_id);
    
    if (existingIndex !== -1) {
      // Update quantity if amenity already exists
      const updatedList = [...amenitiesList];
      updatedList[existingIndex].booking_charges_quantity += currentAmenity.booking_charges_quantity;
      setAmenitiesList(updatedList);
      toast.success('Quantity updated for existing amenity');
    } else {
      // Add new amenity to list
      const newAmenity = {
        ...currentAmenity,
        id: Date.now(), // Temporary ID for React key
        charges_master_name: selectedCharge?.charges_master_name || '',
        charges_category_name: selectedCharge?.charges_category_name || ''
      };
      setAmenitiesList(prev => [...prev, newAmenity]);
      toast.success('Amenity added to list');
    }

    // Reset current amenity form
    setCurrentAmenity({
      charges_master_id: '',
      booking_charges_price: '',
      booking_charges_quantity: 1
    });
    setSelectedCharge(null);
  };

  const removeAmenityFromList = (amenityId) => {
    setAmenitiesList(prev => prev.filter(item => item.id !== amenityId));
    toast.success('Amenity removed from list');
  };

  const updateAmenityQuantity = (amenityId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setAmenitiesList(prev => prev.map(item => 
      item.id === amenityId 
        ? { ...item, booking_charges_quantity: newQuantity }
        : item
    ));
  };

  const handleAddAmenity = async () => {
    if (!selectedBookingRoom || amenitiesList.length === 0) {
      toast.error('Please select a booking room and add at least one amenity');
      return;
    }

    setLoadingAddAmenity(true);
    try {
      const requestData = {
        booking_room_id: selectedBookingRoom.booking_room_id,
        amenities: amenitiesList.map(amenity => ({
          charges_master_id: amenity.charges_master_id,
          booking_charges_price: amenity.booking_charges_price,
          booking_charges_quantity: amenity.booking_charges_quantity
        })),
        booking_charge_status: booking_charge_status
      };

      const formData = new FormData();
      formData.append('method', 'add_amenity_request');
      formData.append('json', JSON.stringify(requestData));

      const response = await axios.post(APIConn, formData);
      console.log('📡 Add amenity response:', response.data);
      
      const result = JSON.parse(response.data);
      console.log('📊 Parsed result:', result);
      
      if (result.success) {
        toast.success(result.message || 'Amenity requests added successfully!');
        onClose();
        resetAmenityForm();
        if (onSuccess) onSuccess();
        // Trigger notification refresh
        setNotificationRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(result.message || 'Failed to add amenity requests');
      }
    } catch (error) {
      toast.error('Failed to add amenity requests');
    } finally {
      setLoadingAddAmenity(false);
      console.log('🏁 handleAddAmenity completed');
    }
  };

  const resetAmenityForm = () => {
    setCurrentAmenity({
      charges_master_id: '',
      booking_charges_price: '',
      booking_charges_quantity: 1
    });
    setSelectedCharge(null);
    setSelectedBookingRoom(null);
    setAmenitiesList([]);
    setBookingChargeStatus(1);
  };

  const calculateGrandTotal = () => {
    return amenitiesList.reduce((total, amenity) => {
      return total + (amenity.booking_charges_price * amenity.booking_charges_quantity);
    }, 0);
  };


  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₱0.00';
    }
    
    try {
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return '₱0.00';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 1: return <Clock className="h-4 w-4 text-yellow-600" />;
      case 2: return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 3: return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };


  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableCharges();
    }
  }, [isOpen, fetchAvailableCharges]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetAmenityForm();
    }
  }, [isOpen]);

  // Handle selected booking room from navigation
  useEffect(() => {
    if (selectedBookingRoomFromNavigation) {
      setSelectedBookingRoom(selectedBookingRoomFromNavigation);
      console.log('🏨 Selected booking room from navigation:', selectedBookingRoomFromNavigation);
    }
  }, [selectedBookingRoomFromNavigation]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] lg:max-w-[95vw] xl:max-w-[98vw] w-[90vw] lg:w-[95vw] xl:w-[98vw] max-h-[95vh] h-[95vh] overflow-y-auto p-8 m-0 rounded-lg">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-3xl font-bold text-gray-900 dark:text-white">
            <Plus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            Add Amenity Requests
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Booking Selection */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="shadow-lg">
               <CardHeader className="pb-4">
                 <CardTitle className="text-xl flex items-center gap-3 text-gray-900 dark:text-white">
                   <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                   Select Booking Room
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="space-y-2">
                   <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                     Booking Room *
                   </Label>
                   {!selectedBookingRoom ? (
                     <Button
                       onClick={handleNavigateToBookingRoomSelection}
                       variant="outline"
                       className="w-full h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                     >
                       <Building className="h-4 w-4 mr-2" />
                       Choose a booking room...
                       <ArrowRight className="h-4 w-4 ml-2" />
                     </Button>
                   ) : (
                     <div className="space-y-2">
                       <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-3 rounded-lg">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                             <span className="text-sm font-medium text-green-800 dark:text-green-300">
                               Room #{selectedBookingRoom.roomnumber_id} • {selectedBookingRoom.roomtype_name}
                             </span>
                           </div>
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={handleNavigateToBookingRoomSelection}
                             className="text-xs h-7 px-2"
                           >
                             Change
                           </Button>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
                 
                 {selectedBookingRoom && (
                   <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-4 rounded-lg">
                     <div className="space-y-3">
                       <div className="flex items-center gap-2">
                         <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                         <span className="font-medium text-base text-gray-900 dark:text-white">{selectedBookingRoom.customer_name}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                         <span className="text-sm text-gray-700 dark:text-gray-300">{selectedBookingRoom.customers_email}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                         <span className="text-sm text-gray-700 dark:text-gray-300">{selectedBookingRoom.customers_phone}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                         <span className="text-sm text-gray-700 dark:text-gray-300">{selectedBookingRoom.booking_status_name}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                         <span className="text-sm text-gray-700 dark:text-gray-300">
                           Room #{selectedBookingRoom.roomnumber_id} • {selectedBookingRoom.roomtype_name}
                         </span>
                       </div>
                     </div>
                   </div>
                 )}
               </CardContent>
            </Card>

            {/* Status Selection */}
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-3 text-gray-900 dark:text-white">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  Set Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status for All Amenities
                  </Label>
                          <Select value={booking_charge_status.toString()} onValueChange={(value) => setBookingChargeStatus(parseInt(value))}>
                            <SelectTrigger className="mt-2 h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">
                                <div className="flex items-center gap-3">
                                  {getStatusIcon(1)}
                                  <span className="text-base text-gray-900 dark:text-white">Pending</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="2">
                                <div className="flex items-center gap-3">
                                  {getStatusIcon(2)}
                                  <span className="text-base text-gray-900 dark:text-white">Approved</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Add Amenity */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-3 text-gray-900 dark:text-white">
                  <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  Add Amenity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Charge Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amenity *
                  </Label>
                  <Select value={currentAmenity.charges_master_id} onValueChange={handleChargeSelect}>
                    <SelectTrigger className="h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select an amenity..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCharges.map((charge) => (
                        <SelectItem key={charge.charges_master_id} value={charge.charges_master_id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white">{charge.charges_master_name}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {charge.charges_category_name} • {formatCurrency(charge.charges_master_price)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedCharge && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="space-y-4">
                        <h4 className="font-medium text-lg text-gray-900 dark:text-white">{selectedCharge.charges_master_name}</h4>
                        <p className="text-base text-gray-600 dark:text-gray-300">{selectedCharge.charges_master_description}</p>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-blue-600 dark:text-blue-400 text-sm px-3 py-1 border-blue-600 dark:border-blue-400">
                            {selectedCharge.charges_category_name}
                          </Badge>
                          <span className="text-base font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(selectedCharge.charges_master_price)} each
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price and Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Price per Unit *
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={currentAmenity.booking_charges_price}
                      onChange={(e) => setCurrentAmenity(prev => ({
                        ...prev,
                        booking_charges_price: parseFloat(e.target.value) || 0
                      }))}
                      className="h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Quantity *
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={currentAmenity.booking_charges_quantity}
                      onChange={(e) => setCurrentAmenity(prev => ({
                        ...prev,
                        booking_charges_quantity: parseInt(e.target.value) || 1
                      }))}
                      className="h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Preview Total */}
                {currentAmenity.booking_charges_price && currentAmenity.booking_charges_quantity && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-6 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium text-green-800 dark:text-green-300">Line Total:</span>
                      <span className="text-xl font-bold text-green-700 dark:text-green-400">
                        {formatCurrency(currentAmenity.booking_charges_price * currentAmenity.booking_charges_quantity)}
                      </span>
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                      {currentAmenity.booking_charges_quantity} × {formatCurrency(currentAmenity.booking_charges_price)}
                    </div>
                  </div>
                )}

                {/* Add to List Button */}
                        <Button 
                          onClick={addAmenityToList}
                          disabled={!currentAmenity.charges_master_id || !currentAmenity.booking_charges_price || !currentAmenity.booking_charges_quantity}
                          className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white h-10"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to List
                        </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Selected Amenities */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center justify-between text-gray-900 dark:text-white">
                  <div className="flex items-center gap-3">
                    <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    <span>Selected Amenities</span>
                  </div>
                  <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-sm px-3 py-1 border-indigo-600 dark:border-indigo-400">
                    {amenitiesList.length} item{amenitiesList.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {amenitiesList.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Package className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                    <p className="font-medium text-lg mb-2 text-gray-700 dark:text-gray-300">No amenities added yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Select a booking and add amenities to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {amenitiesList.map((amenity) => (
                      <div key={amenity.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-gray-200 dark:border-gray-600">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-medium text-base text-gray-900 dark:text-white">{amenity.charges_master_name}</p>
                                <Badge variant="outline" className="mt-1 text-xs px-2 py-1 text-gray-700 dark:text-gray-300 border-gray-400 dark:border-gray-500">
                                  {amenity.charges_category_name}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg text-gray-900 dark:text-white">
                                  {formatCurrency(amenity.booking_charges_price * amenity.booking_charges_quantity)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatCurrency(amenity.booking_charges_price)} each
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">Quantity:</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateAmenityQuantity(amenity.id, amenity.booking_charges_quantity - 1)}
                                  disabled={amenity.booking_charges_quantity <= 1}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-medium text-sm text-gray-900 dark:text-white">{amenity.booking_charges_quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateAmenityQuantity(amenity.id, amenity.booking_charges_quantity + 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeAmenityFromList(amenity.id)}
                            className="ml-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Grand Total */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 p-6 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-gray-900 dark:text-white">Grand Total:</span>
                        <span className="text-2xl font-bold text-[#113f67] dark:text-blue-400">
                          {formatCurrency(calculateGrandTotal())}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        Total for {amenitiesList.length} amenit{amenitiesList.length !== 1 ? 'ies' : 'y'}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="outline" 
            onClick={() => {
              onClose();
              resetAmenityForm();
            }}
            className="min-w-[120px] h-10 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
           <Button
             onClick={handleAddAmenity}
             disabled={loadingAddAmenity || !selectedBookingRoom || amenitiesList.length === 0}
             className="bg-[#113f67] hover:bg-[#0d2a4a] dark:bg-blue-700 dark:hover:bg-blue-600 text-white min-w-[180px] h-10"
           >
            {loadingAddAmenity ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding {amenitiesList.length} Amenit{amenitiesList.length !== 1 ? 'ies' : 'y'}...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add {amenitiesList.length} Amenit{amenitiesList.length !== 1 ? 'ies' : 'y'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddAmenityRequestModal;
