// Import the database of world locations
import { City, State, Country } from "country-state-city";

export const transformDataForZoho = (input) => {
  // --- 1. NAME SPLITTING (Same as before) ---
  const rawName = input.fullName || "Guest User";
  const nameParts = rawName.trim().split(" ");
  const lastName = nameParts.length > 1 ? nameParts.pop() : "Unknown"; 
  const firstName = nameParts.join(" ");

  // --- 2. CITY INTELLIGENCE (The "Pro" Way) ---
  let stateName = "Unknown";
  let countryName = "Unknown";
  const cityName = input.city ? input.city.trim() : "";

  if (cityName) {
    // Search the entire world database for this city
    // Note: This matches "Pune" (User input) to "Pune" (Database)
    const allCities = City.getAllCities();
    const foundCity = allCities.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase()
    );

    if (foundCity) {
      // If found, look up the full Country and State names using their codes
      const country = Country.getCountryByCode(foundCity.countryCode);
      const state = State.getStateByCodeAndCountry(foundCity.stateCode, foundCity.countryCode);

      countryName = country ? country.name : "Unknown";
      stateName = state ? state.name : "Unknown";
    }
  }

  // --- 3. MATH CALCULATION (Age) ---
  const birthYear = Number(input.birthYear) || 2000;
  const currentYear = new Date().getFullYear();
  const calculatedAge = currentYear - birthYear;

  // --- 4. STRING MANIPULATION (Company Extraction) ---
  let companyName = "Personal";
  if (input.email && input.email.includes("@")) {
    const domain = input.email.split("@")[1]; 
    const name = domain.split(".")[0];       
    companyName = name.charAt(0).toUpperCase() + name.slice(1); 
  }

  // --- 5. RETURN FINAL DATA ---
  return {
    First_Name: firstName,
    Last_Name: lastName,
    Email: input.email,
    
    // The smart location data:
    City: cityName,     
    State: stateName,      
    Country: countryName, 
    
    Company: companyName,
    Annual_Revenue: calculatedAge, 
    Description: `User Age: ${calculatedAge} (Born: ${birthYear})`
  };
};