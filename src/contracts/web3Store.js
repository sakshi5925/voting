let provider=null;
let signer=null;
export const setProvider=(p)=>{provider=p};
export const getProvider=()=>provider;
export const setSigner=(s)=>{signer=s};
export const getSigner=()=>signer;
export const clearWeb3Store = () => {
  provider = null;
  signer = null;
}