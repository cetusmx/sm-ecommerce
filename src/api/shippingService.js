const ENVIA_API_KEY = process.env.REACT_APP_ENVIA_API_KEY;
const ENVIA_API_URL = process.env.REACT_APP_ENVIA_API_URL;

/**
 * Fetches shipping rates from the envia.com API.
 * @param {object} originAddress - The origin address.
 * @param {object} destinationAddress - The destination address.
 * @param {object} parcel - The parcel details (weight, dimensions).
 * @returns {Promise<object>} The shipping rates data.
 */
export const getShippingRates = async (originAddress, destinationAddress, parcel) => {
  const payload = {
    origin: originAddress,
    destination: destinationAddress,
    packages: [parcel],
    shipment: {
      carrier: "dhl",
      type: 1, // Set to 1 for Package
      import: 0
    },
    settings: {
      currency: "MXN"
    }
  };

  try {
    const response = await fetch(ENVIA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ENVIA_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Envia.com API Error:', errorData);
      throw new Error(errorData.error || 'Failed to fetch shipping rates');
    }

    const responseData = await response.json();
    console.log("Envia.com API Raw Response:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error fetching shipping rates:", error);
    throw error;
  }
};