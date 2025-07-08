import { FiUser, FiMail, FiBriefcase, FiGithub, FiSend } from 'react-icons/fi';
import { OnboardingInput, OnboardingSelect, OnboardingLabel } from '../styles/StyledComponents';

const OnboardingDemoForm = ({ formData, handleInputChange, handleSubmit, isSubmitting }) => {
  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  return (
  <div className="bg-slate-50 rounded-lg shadow-lg p-8 h-full">
    <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Employee Information</h2>
    <div className="bg-slate-800 text-green-400 p-6 rounded-lg h-[500px] border border-slate-600 relative">
      {/* Form header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="text-gray-400 text-xs">onboarding-form</div>
      </div>
      
      {/* Form content */}
      <div className="h-[calc(100%-60px)] overflow-y-auto pr-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <OnboardingLabel>
                <FiUser className="inline mr-2" />
                First Name *
              </OnboardingLabel>
              <OnboardingInput
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                placeholder="Louis"
              />
            </div>
            <div>
              <OnboardingLabel>
                <FiUser className="inline mr-2" />
                Last Name *
              </OnboardingLabel>
              <OnboardingInput
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                placeholder="Yangga"
              />
            </div>
          </div>

          <div>
            <OnboardingLabel>
              <FiMail className="inline mr-2" />
              Email *
            </OnboardingLabel>
            <OnboardingInput
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="LouisYangga@company.com"
              title="Please enter a valid email address (e.g., user@company.com)"
            />
            {formData.email && !validateEmail(formData.email) && (
              <div className="text-red-500 text-sm mt-1">
                Please enter a valid email address
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <OnboardingLabel>
                <FiBriefcase className="inline mr-2" />
                Department *
              </OnboardingLabel>
              <OnboardingSelect
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Design">Design</option>
              </OnboardingSelect>
            </div>
            <div>
              <OnboardingLabel>
                <FiBriefcase className="inline mr-2" />
                Job Title *
              </OnboardingLabel>
              <OnboardingInput
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div>
            <OnboardingLabel>
              <FiGithub className="inline mr-2" />
               GitHub Username (Optional)
            </OnboardingLabel>
            <OnboardingInput
              type="text"
              name="githubUsername"
              value={formData.githubUsername}
              onChange={handleInputChange}
              placeholder="LouisYangga"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm mt-6"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <FiSend className="mr-2" />
                Start Onboarding Process
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  </div>
  );
};

export default OnboardingDemoForm; 