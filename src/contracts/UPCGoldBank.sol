pragma solidity ^0.5.16;

contract UPCGoldBank {
     
    
    struct Deposit {
        uint amount;
        uint timestamps;
    }
    
    struct Balance {
        uint                        totalBalance;
        uint                        numPayments;
        mapping(uint => Deposit)    deposits;
    }
    
    struct LeaseMeta {
        address  staker;  //address of the staker
        uint     amountStaked;
        bool     isOwned;
        uint     interestGained;
        uint     stakingStartTimestamp;
    }
    
    mapping(address => Balance)     public balanceReceived;
    mapping(bytes32  => LeaseMeta)   public scannables;       //pass in the upcId and look up the meta about the upc
    uint public actionPot;

    function internalTransfer(address _to, uint _amount) public {
        require(balanceReceived[msg.sender].totalBalance >= _amount, "Insufficient funds for internal transfer" );
        balanceReceived[msg.sender].totalBalance -= _amount;
        balanceReceived[_to].totalBalance += _amount; 
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }

    function getAddressBalance() public view returns(uint) {
        return balanceReceived[msg.sender].totalBalance;
    }

    function getCostToEvict(string memory upcId) public view returns(address currentStaker, uint currentAmountStaked, bool currentIsOwned, bytes32 upcHash) {
        upcHash = sha256(abi.encodePacked(upcId));
        currentStaker = scannables[upcHash].staker;
        currentAmountStaked = scannables[upcHash].amountStaked;
        currentIsOwned = scannables[upcHash].isOwned;
    }

    function depositMoney(string memory upcId) public payable {
        bytes32 upcHash = sha256(abi.encodePacked(upcId));
        uint _addToActionPot = this.calculateFee(msg.value);
        uint _addToBalance = msg.value - _addToActionPot; //take eth out to do good with

        //look into registering an unstoppable domain id.  verify on the blockchain that the msg.sender == the owner of the domain
        //(, uint currentAmountStaked ,) = this.getCostToEvict(upcId);
        bool currentIsOwned      = scannables[upcHash].isOwned;
        require(currentIsOwned == false, "Can not stake in an owned code without permission.");

        uint currentAmountStaked = scannables[upcHash].amountStaked;
        
        if(msg.sender != scannables[upcHash].staker) {
            require(_addToBalance > currentAmountStaked, "You must outstake the current stakeholder to win this lease.");
        }
        
        if(msg.sender != scannables[upcHash].staker) {
            uint evictionPrice = evict(upcHash);
            //after an eviction, currentAmountStaked should equal zero to make way for the new owner's currentAmountStaked
            currentAmountStaked = scannables[upcHash].amountStaked;
        }

        LeaseMeta memory lm;
        lm.staker = msg.sender;
        lm.amountStaked = currentAmountStaked + _addToBalance;
        lm.isOwned =  false;
        lm.stakingStartTimestamp = now;
        scannables[upcHash] = lm;
        
        //require(balanceReceived[msg.sender].totalBalance >= _amount, "Insufficient funds for internal transfer" );

        balanceReceived[msg.sender].totalBalance += _addToBalance;
        Deposit memory deposit = Deposit(_addToBalance, now);
        balanceReceived[msg.sender].deposits[balanceReceived[msg.sender].numPayments] = deposit;
        balanceReceived[msg.sender].numPayments++;
        
        address payable _actionPot = address(0x22F23F59A19a5EEd1eE9c546F64CC645B92a4263);
        _actionPot.transfer(_addToActionPot);
        actionPot += _addToActionPot;
        
    }
    
    function calculateFee(uint amount) external pure returns (uint) {
        require((amount / 10000) * 10000 == amount , 'too small');
        return amount * 185 / 10000;
    }

    function evict(bytes32 upcHash) private returns (uint) {
        
        uint toWithdraw = scannables[upcHash].amountStaked;
        address payable _to = address(uint160(scannables[upcHash].staker));
        balanceReceived[_to].totalBalance -= toWithdraw;
        scannables[upcHash].amountStaked = 0;
        _to.transfer(toWithdraw);
        return toWithdraw;
    }
    
    function withdraw(string memory upcId) public {
        bytes32 upcHash = sha256(abi.encodePacked(upcId));
        require(msg.sender == scannables[upcHash].staker, "Only the staker can withdraw" );
        uint toWithdraw = scannables[upcHash].amountStaked;
        address payable _to = msg.sender;
        balanceReceived[msg.sender].totalBalance -= toWithdraw;
        scannables[upcHash].amountStaked -= toWithdraw;
        scannables[upcHash].staker = address(0x0);
        _to.transfer(toWithdraw - 1);
    }
    
}