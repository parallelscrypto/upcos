// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MemecoinFactory is Ownable {
    event TokenCreated(
        address indexed creator,
        address indexed tokenAddress,
        string name,
        string symbol,
        uint256 templateId
    );
    
    struct TokenTemplate {
        string name;
        string description;
        bool active;
        bytes bytecode;
    }
    
    address[] public allTokens;
    TokenTemplate[] public templates;
    mapping(address => address[]) public userTokens;
    
    uint256 public creationFee = 0.01 ether;
    bool public feeEnabled = false;
    
    constructor() Ownable(msg.sender) {
        _addDefaultTemplates();
    }
    
    function _addDefaultTemplates() internal {
        // Template 0: Standard Burnable Memecoin
        templates.push(TokenTemplate({
            name: "Standard Burnable Memecoin",
            description: "Basic ERC20 with burn functionality",
            active: true,
            bytecode: type(StandardBurnableMemecoin).creationCode
        }));
        
        // Template 1: Mintable Memecoin
        templates.push(TokenTemplate({
            name: "Mintable Memecoin",
            description: "Owner can mint additional tokens",
            active: true,
            bytecode: type(MintableMemecoin).creationCode
        }));
        
        // Template 2: Tax Memecoin
        templates.push(TokenTemplate({
            name: "Tax Memecoin",
            description: "5% transfer tax",
            active: true,
            bytecode: type(TaxMemecoin).creationCode
        }));
    }
    
    function createMemecoin(
        uint256 templateId,
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        bytes memory extraParams
    ) external payable returns (address) {
        require(templateId < templates.length, "Invalid template");
        require(templates[templateId].active, "Template disabled");
        
        if (feeEnabled) {
            require(msg.value >= creationFee, "Insufficient fee");
        }
        
        bytes memory bytecode = abi.encodePacked(
            templates[templateId].bytecode,
            abi.encode(name, symbol)
        );
        
        address tokenAddress;
        assembly {
            tokenAddress := create(0, add(bytecode, 0x20), mload(bytecode))
        }
        
        (bool success, ) = tokenAddress.call(
            abi.encodeWithSignature(
                "initialize(uint256,address,bytes)",
                initialSupply,
                msg.sender,
                extraParams
            )
        );
        
        require(success, "Initialization failed");
        
        allTokens.push(tokenAddress);
        userTokens[msg.sender].push(tokenAddress);
        
        emit TokenCreated(msg.sender, tokenAddress, name, symbol, templateId);
        return tokenAddress;
    }
    
    function getUserTokenCount(address user) external view returns (uint256) {
        return userTokens[user].length;
    }
    
    function getUserTokens(address user, uint256 start, uint256 count) external view returns (address[] memory) {
        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userTokens[user][start + i];
        }
        return result;
    }
    
    function addTemplate(string memory name, string memory description, bytes memory bytecode) external onlyOwner {
        templates.push(TokenTemplate({
            name: name,
            description: description,
            active: true,
            bytecode: bytecode
        }));
    }
    
    function toggleTemplate(uint256 templateId, bool active) external onlyOwner {
        templates[templateId].active = active;
    }
    
    function setCreationFee(uint256 fee) external onlyOwner {
        creationFee = fee;
    }
    
    function toggleFee(bool enabled) external onlyOwner {
        feeEnabled = enabled;
    }
    
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

contract StandardBurnableMemecoin is ERC20, ERC20Burnable, Ownable {
    constructor(string memory name, string memory symbol) 
        ERC20(name, symbol) 
        ERC20Burnable()
        Ownable(msg.sender)
    {}
    
    function initialize(
        uint256 initialSupply,
        address owner,
        bytes memory
    ) external {
        transferOwnership(owner);
        _mint(owner, initialSupply * (10 ** decimals()));
    }
}

contract MintableMemecoin is ERC20, Ownable {
    constructor(string memory name, string memory symbol) 
        ERC20(name, symbol)
        Ownable(msg.sender)
    {}
    
    function initialize(
        uint256 initialSupply,
        address owner,
        bytes memory
    ) external {
        transferOwnership(owner);
        _mint(owner, initialSupply * (10 ** decimals()));
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

contract TaxMemecoin is ERC20, Ownable {
    uint256 public constant TAX_RATE = 500; // 5%
    address public taxWallet;
    
    constructor(string memory name, string memory symbol) 
        ERC20(name, symbol)
        Ownable(msg.sender)
    {}
    
    function initialize(
        uint256 initialSupply,
        address owner,
        bytes memory extraParams
    ) external {
        transferOwnership(owner);
        taxWallet = abi.decode(extraParams, (address));
        _mint(owner, initialSupply * (10 ** decimals()));
    }
    
    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        uint256 tax = (amount * TAX_RATE) / 10000;
        uint256 netAmount = amount - tax;
        
        _transfer(_msgSender(), taxWallet, tax);
        _transfer(_msgSender(), recipient, netAmount);
        return true;
    }
    
    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        uint256 tax = (amount * TAX_RATE) / 10000;
        uint256 netAmount = amount - tax;
        
        _transfer(sender, taxWallet, tax);
        _transfer(sender, recipient, netAmount);
        
        uint256 currentAllowance = allowance(sender, _msgSender());
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        unchecked {
            _approve(sender, _msgSender(), currentAllowance - amount);
        }
        return true;
    }
}
