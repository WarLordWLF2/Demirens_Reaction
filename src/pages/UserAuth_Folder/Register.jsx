import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [getNationalities, setGetNationalities] = useState([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    nationality: "",
    dob: "",
    phone: "",  // ✅ Added phone field
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const allNationalities = async () => {
      const formData = new FormData();
      formData.append("operation", "getNationality");

      try {
        const url = localStorage.getItem("url") + "customer.php";
        const res = await axios.post(url, formData);

        if (res.data !== 0) {
          setGetNationalities(res.data);
        } else {
          toast.error("Failed to load nationalities");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error loading nationalities");
      }
    };

    allNationalities();
  }, []);

  const handleChange = (name, value) => {
    // Apply input restrictions based on field type
    let processedValue = value;
    
    switch (name) {
      case 'firstName':
      case 'lastName':
        // Only allow letters, spaces, hyphens, and apostrophes
        processedValue = value.replace(/[^a-zA-Z\s'-]/g, '');
        break;
      case 'username':
        // Only allow letters, numbers, and underscores
        processedValue = value.replace(/[^a-zA-Z0-9_]/g, '');
        break;
      case 'email':
        // Allow email characters
        processedValue = value.replace(/[^a-zA-Z0-9@._%+-]/g, '');
        break;
      case 'phone':
        // Only allow digits, spaces, hyphens, parentheses, and plus sign
        processedValue = value.replace(/[^0-9+\-\s()]/g, '');
        break;
      default:
        processedValue = value;
    }
    
    setFormData({
      ...formData,
      [name]: processedValue,
    });
  };

  const validateForm = () => {
    // Validate First Name
    if (!formData.firstName.trim()) {
      toast.error("First name is required");
      return false;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName.trim())) {
      toast.error("First name can only contain letters, spaces, hyphens, and apostrophes");
      return false;
    }
    if (formData.firstName.trim().length < 2) {
      toast.error("First name must be at least 2 characters");
      return false;
    }
    if (formData.firstName.trim().length > 50) {
      toast.error("First name must be less than 50 characters");
      return false;
    }

    // Validate Last Name
    if (!formData.lastName.trim()) {
      toast.error("Last name is required");
      return false;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName.trim())) {
      toast.error("Last name can only contain letters, spaces, hyphens, and apostrophes");
      return false;
    }
    if (formData.lastName.trim().length < 2) {
      toast.error("Last name must be at least 2 characters");
      return false;
    }
    if (formData.lastName.trim().length > 50) {
      toast.error("Last name must be less than 50 characters");
      return false;
    }

    // Validate Username
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      toast.error("Username can only contain letters, numbers, and underscores");
      return false;
    }
    if (formData.username.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return false;
    }
    if (formData.username.trim().length > 20) {
      toast.error("Username must be less than 20 characters");
      return false;
    }

    // Validate Email
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (formData.email.trim().length > 100) {
      toast.error("Email must be less than 100 characters");
      return false;
    }

    // Validate Nationality
    if (!formData.nationality) {
      toast.error("Nationality is required");
      return false;
    }

    // Validate Date of Birth
    if (!formData.dob) {
      toast.error("Date of birth is required");
      return false;
    }
    const birthDate = new Date(formData.dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      // Haven't had birthday this year yet
      const actualAge = age - 1;
      if (actualAge < 13) {
        toast.error("You must be at least 13 years old to register");
        return false;
      }
      if (actualAge > 120) {
        toast.error("Please enter a valid date of birth");
        return false;
      }
    } else {
      if (age < 13) {
        toast.error("You must be at least 13 years old to register");
        return false;
      }
      if (age > 120) {
        toast.error("Please enter a valid date of birth");
        return false;
      }
    }
    
    // Check if date is in the future
    if (birthDate > today) {
      toast.error("Date of birth cannot be in the future");
      return false;
    }

    // Validate Phone Number
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    // Remove all non-digit characters for validation
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      toast.error("Phone number must be at least 10 digits");
      return false;
    }
    if (phoneDigits.length > 15) {
      toast.error("Phone number must be less than 15 digits");
      return false;
    }
    if (!/^[0-9+\-\s()]+$/.test(formData.phone.trim())) {
      toast.error("Phone number contains invalid characters");
      return false;
    }

    // Validate Password
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    if (formData.password.length > 128) {
      toast.error("Password must be less than 128 characters");
      return false;
    }
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(formData.password)) {
      toast.error("Password must contain at least one uppercase letter");
      return false;
    }
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(formData.password)) {
      toast.error("Password must contain at least one lowercase letter");
      return false;
    }
    // Check for at least one number
    if (!/[0-9]/.test(formData.password)) {
      toast.error("Password must contain at least one number");
      return false;
    }
    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      toast.error("Password must contain at least one special character");
      return false;
    }

    // Validate Confirm Password
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Encrypt OTP (simple encryption for demo - use proper encryption in production)
      const encryptedOTP = btoa(otp + formData.email);
      
      // Store encrypted OTP in sessionStorage
      sessionStorage.setItem('registrationOTP', encryptedOTP);
      sessionStorage.setItem('registrationEmail', formData.email);
      sessionStorage.setItem('otpExpiry', Date.now() + 300000); // 5 minutes

      const url = localStorage.getItem("url") + "customer.php";
      const otpForm = new FormData();
      otpForm.append("operation", "checkAndSendOTP");
      otpForm.append("json", JSON.stringify({ 
        guest_email: formData.email,
        otp_code: otp 
      }));

      const res = await axios.post(url, otpForm);

      console.log("OTP Response:", res.data);

      // Handle the response - axios should automatically parse JSON
      const responseData = res.data;

      if (responseData?.success) {
        toast.success("OTP sent to your email!");
        navigate("/verify", { state: { customer: formData } });
      } else {
        console.error("OTP Error:", responseData);
        toast.error(responseData?.message || "Failed to send OTP");
        // Clear sessionStorage on failure
        sessionStorage.removeItem('registrationOTP');
        sessionStorage.removeItem('registrationEmail');
        sessionStorage.removeItem('otpExpiry');
      }
    } catch (err) {
      toast.error("Something went wrong.");
      console.error(err);
      // Clear sessionStorage on error
      sessionStorage.removeItem('registrationOTP');
      sessionStorage.removeItem('registrationEmail');
      sessionStorage.removeItem('otpExpiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#f7fbfc] to-[#eaf0f6] relative">
      {/* Back to Landing Page Button - Top Left */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          asChild
          className="text-[#769FCD] hover:text-[#5578a6] hover:bg-[#769FCD]/10 p-2 h-auto bg-white/80 backdrop-blur-sm"
        >
          <Link to="/" className="flex items-center gap-2 text-sm">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </Button>
      </div>
      
      {/* Left side - Hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-[#113f67] via-[#34699A] to-[#226597]344rd p-6 md:p-8 lg:p-10 flex-col justify-center items-center text-white">
        <div className="max-w-md mx-auto space-y-4 md:space-y-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center">Welcome to Demirens Hotel</h1>
          <p className="text-base md:text-lg lg:text-xl opacity-90 text-center">Create your account to enjoy exclusive benefits and seamless booking experience.</p>

          {/* SVG Icon */}
          <div className="flex justify-center mt-6 md:mt-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-28 md:w-32 lg:w-36 h-28 md:h-32 lg:h-36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-4 py-6 sm:px-6 md:px-8 lg:px-10 md:py-8">
        <div className="w-full max-w-md p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl ">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#769FCD] mb-3 sm:mb-4 md:mb-6 text-center">
            Create Your Account
          </div>

          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm sm:text-base font-medium text-gray-700">First Name</label>
                <Input
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:border-[#769FCD] focus:ring focus:ring-[#769FCD] focus:ring-opacity-25 transition-all"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm sm:text-base font-medium text-gray-700">Last Name</label>
                <Input
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className="h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:border-[#769FCD] focus:ring focus:ring-[#769FCD] focus:ring-opacity-25 transition-all"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm sm:text-base font-medium text-gray-700">Email</label>
                <Input
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:border-[#769FCD] focus:ring focus:ring-[#769FCD] focus:ring-opacity-25 transition-all"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm sm:text-base font-medium text-gray-700">Nationality</label>
                <select
                  value={formData.nationality}
                  onChange={(e) => handleChange("nationality", e.target.value)}
                  className="w-full h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:border-[#769FCD] focus:ring focus:ring-[#769FCD] focus:ring-opacity-25 transition-all"
                  required
                >
                  <option value="">Select Nationality</option>
                  {getNationalities.length > 0 ? (
                    getNationalities.map((nat) => (
                      <option key={nat.nationality_id} value={nat.nationality_id}>
                        {nat.nationality_name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading...</option>
                  )}
                </select>
              </div>
                      <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm sm:text-base font-medium text-gray-700">Date of Birth</label>
              <Input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
                className="h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:border-[#769FCD] focus:ring focus:ring-[#769FCD] focus:ring-opacity-25 transition-all"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm sm:text-base font-medium text-gray-700">Phone Number</label>
              <Input
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) =>
                  handleChange("phone", e.target.value) // Use handleChange for proper validation
                }
                maxLength={15}
                className="h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:border-[#769FCD] focus:ring focus:ring-[#769FCD] focus:ring-opacity-25 transition-all"
              />
            </div>
            </div>


            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm sm:text-base font-medium text-gray-700">Username</label>
              <Input
                placeholder="Username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className="h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:border-[#769FCD] focus:ring focus:ring-[#769FCD] focus:ring-opacity-25 transition-all"
              />
            </div>


    


            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm sm:text-base font-medium text-gray-700">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:border-[#769FCD] focus:ring focus:ring-[#769FCD] focus:ring-opacity-25 transition-all pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                * At least 8 characters, must include uppercase, lowercase, number, and special character
              </p>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm sm:text-base font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  className="h-9 sm:h-10 px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:border-[#769FCD] focus:ring focus:ring-[#769FCD] focus:ring-opacity-25 transition-all pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-9 sm:h-11 px-4 py-2 text-sm sm:text-base bg-[#769FCD] hover:bg-[#5578a6] text-white font-semibold rounded-md shadow transition-colors mt-2 sm:mt-3"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>

            <p className="text-xs sm:text-sm text-muted-foreground text-center mt-4 sm:mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="underline underline-offset-4 text-[#769FCD] hover:text-[#5578a6] font-medium transition-all"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
