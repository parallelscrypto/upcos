pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Context.sol";
//import "./stringUtils.sol";
import "./RawMaterial.sol";
import "./Flip.sol";

interface USDC {
    function transfer(address dst, uint wad) external returns (bool);
    function transferFrom(address src, address dst, uint wad) external returns (bool);
    function balanceOf(address guy) external view returns (uint);
}

/**
 * @title SimpleToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `ERC20` functions.
 */
contract CoinBox is Context, ERC20, ERC20Burnable {

    modifier onlyOwner {
       require(msg.sender == owner);
       _;
    }


    struct NFTMeta {
        uint256  tokenId;
        address  staker;  //address of the staker
        address  og;  //address of the staker
        bytes32  upcHash;
        string   word;
        string   ipfs;
        string   vr;
        string   humanReadableName;
        bool     minted;
        bool     bought;
        uint     tld;
        uint256  createdTimestamp;
        uint256  latestTimestamp;
    }

    mapping(string => uint)     public totalClaims;
    mapping(string => uint)     public tokenPrice;
    mapping(string => uint)     public tokenFee;
    mapping(string => uint)     public narativBalanceReceived;
    mapping(string => uint)     public usdcBalanceReceived;
    uint256    currentNftPrice;
    uint public balance = 0;
    uint public bulkPrice = 20000000000000000000;
    uint public bulkCount = 25000000000000000000;

    uint rehash = 3;
    address payable private owner;

    struct Reward {
        uint256  amount;
        string  winningHash;
    }

    Flip       private _narativ;
    USDC          private _usdc;
    RawMaterial        upcNFT;

    Reward[] public rewards;

    /**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */
    constructor () ERC20("CoinBox", "cbx") {
        owner     =   payable(msg.sender);
        _usdc     =   USDC(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174);
        _narativ  =   Flip(0x544E9675DBA14Cfd286545231007eAe84C4bBF45);
        upcNFT    =   RawMaterial(0x62c287A2d9af21369669E555c733cEb1eE5D74b5);
    }

    function injectNarativ(string memory upcId, uint256 numNarativ) public payable {
        narativBalanceReceived[upcId] += numNarativ;
        _narativ.transferFrom(msg.sender, address(this), numNarativ);
    }

    function injectUSDC(string memory upcId, uint256 numUSDC) public payable {
        usdcBalanceReceived[upcId] += numUSDC;
        _usdc.transferFrom(msg.sender, address(this), numUSDC);
    }

function claimTokensBulk(string memory upcId) public payable {

    string memory desiredUpcId = '000000000000';
    require (keccak256(abi.encodePacked(upcId)) == keccak256(abi.encodePacked(desiredUpcId)) , "bulk claims can only be performed in the zeros upc [000000000000]");
    uint deduce = 0;
    totalClaims[upcId]++;
    address upcOwner = upcNFT.getUpcOwner(upcId);
    address payable payableOwner = payable(upcOwner);
    uint possCoinboxTld = upcNFT.getTld(upcId);

    if (possCoinboxTld == 777) {

        if (narativBalanceReceived[upcId] >= bulkCount) {
            deduce = bulkCount;
        } else {
            deduce = narativBalanceReceived[upcId];
        }

        uint ownerFee = bulkPrice;
        uint infastructureFee = 0;


        uint totalPrice = ownerFee + infastructureFee;

        require(msg.value >= totalPrice, "Accessing coinbox requires sufficient token fee.");
        uint remainder = msg.value - ownerFee - infastructureFee;

        payableOwner.transfer(ownerFee);
        owner.transfer(infastructureFee);

        // if for some reason the user sends more than needed, transfer the extra to the upc owner
        if (remainder > 0) {
            payableOwner.transfer(remainder);
        }
    }

    require(deduce > 0, "Will not send zero tokens");

    narativBalanceReceived[upcId] -= deduce; // each claim call will send the claimant the specified number of tokens
    _narativ.transfer(msg.sender, deduce);
}


    function claimNarativToken(string memory upcId) public payable{
        uint deduce = 0;
        totalClaims[upcId]++;
        address upcOwner = upcNFT.getUpcOwner(upcId);
        address payable payableOwner = payable(upcOwner);
        uint possCoinboxTld = upcNFT.getTld(upcId);

        if(possCoinboxTld == 777 ) {
            deduce = 250000000000000000;
            if (narativBalanceReceived[upcId] < deduce) {
                deduce = narativBalanceReceived[upcId];
            }
            
            uint ownerFee          = 150000000000000000;
            if(tokenPrice[upcId] > 0) {
               ownerFee = tokenPrice[upcId];
            }

            uint infastructureFee  = 100000000000000000;
            if(tokenFee[upcId] > 0) {
               infastructureFee = tokenFee[upcId];
            }

            uint totalPrice         =  ownerFee + infastructureFee;

            require(msg.value >= totalPrice , "Accessing coinbox requires sufficient token fee.");
            uint remainder         = msg.value - ownerFee - infastructureFee;

            payableOwner.transfer(ownerFee);
            owner.transfer(infastructureFee);

            //if for some reason the user sends more than needed, transfer the extra to the upc owner
            if(remainder > 0) {
                payableOwner.transfer(remainder);
            }            

        }
        else if(msg.sender == upcOwner) {
            deduce = narativBalanceReceived[upcId];
        }
        else if(upcOwner == address(0x0)) {
            deduce = 100000000000000000;
        }

        
        require(deduce > 0 , "Will not send zero tokens");
        
        narativBalanceReceived[upcId]-= deduce; 
        _narativ.transfer(msg.sender, deduce);
    }


    function setTokenPrice(string memory upcId, uint price) public {
        address upcOwner = upcNFT.getUpcOwner(upcId);
        require(msg.sender == upcOwner, "Unauthorized setPrice on this upc");

        require(price > 0 , "Will not set price to zero tokens");
        tokenPrice[upcId] = price;
    }


    function setBulkCount(uint count) public onlyOwner {
        bulkCount = count;
    }


    function setBulkPrice(uint price) public onlyOwner {
        bulkPrice = price;
    }


    function setTokenFee(string memory upcId, uint fee) public onlyOwner {
        tokenFee[upcId] = fee;
    }


    function setDecolonizeAfrica(address newAddress) public  onlyOwner{
        upcNFT = RawMaterial(newAddress);
    }

    
    function setNarativ(address newAddress) public  onlyOwner{
        _narativ = Flip(newAddress);
    }

    function getPrice(string memory upcId) public view returns (uint256)  {

        uint possCoinboxTld = upcNFT.getTld(upcId);

        require(possCoinboxTld == 777, "Price only applies to coinnbox" );

        uint fee = tokenFee[upcId];
        uint price = tokenPrice[upcId];

        if(fee <= 0)  {
           fee = 100000000000000000;
        }

        if(price <= 0) {
           price = 150000000000000000;
        }

        return fee + price;
    }

    function setOwner(address newAddress) public  onlyOwner{
        owner = payable(newAddress);
    }    
}
