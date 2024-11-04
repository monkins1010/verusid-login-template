import Axios from "axios";

const { VITE_API_SERVER } = import.meta.env;

export const login = async () => {
  try{

      let response = await Axios.post(VITE_API_SERVER + "/login", null);

      //console.log("dataPost:",response);
      return {
          data: response.data.data,
          success: true,
          status: response.status
      }

  } catch(error){
    
      return {
          data: null,
          success: false,
          error: error?.message ? error.message : "Failed to get QR"
      }
  }
}

