// 引入相关文件
// 网关地址：http://192.168.11.120:8545/
// Market address：
// 0x9Aaa1475632dDEcAc3196FF3273cABC8916219fA
// NFT address：
// 0x5989415E7d0764e36EE7b0bc4b5B4cdcF87b1570
import { ethers } from "ethers"; //引入ethers.js
import Web3Modal from "web3modal"; //引入web3modal
// NFT合约
import NFT from "../../abi/NFT_ABI.json"; // 引入abi
const nftaddress = "0x5989415E7d0764e36EE7b0bc4b5B4cdcF87b1570";
// Market合约
import Market from "../../abi/Mkt_ABI.json"; // 引入abi
const marketaddress = "0x9Aaa1475632dDEcAc3196FF3273cABC8916219fA";
async function abiContract() {
    //连接钱包，获取签名
    const web3Modal = new Web3Modal({
        network: "mainnet",
        cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    return {
        //连接合约与对应的abi接口，使其可以调用abi接口
        //nft
        nftContract: new ethers.Contract(nftaddress, NFT.abi, signer),
        tokenContract: new ethers.Contract(nftaddress, NFT.abi, provider),
        //market
        marketContract: new ethers.Contract(marketaddress, Market.abi, signer),
        marketitemContract: new ethers.Contract(marketaddress, Market.abi, provider),
        nftaddress: "0x5989415E7d0764e36EE7b0bc4b5B4cdcF87b1570",
        marketaddress: "0x9Aaa1475632dDEcAc3196FF3273cABC8916219fA",
    }
}
export default abiContract;