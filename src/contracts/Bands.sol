// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./Flip.sol";


contract Bands {
    struct Experience {
        string url;
        string upc;
        uint256 topicId;
    }

    struct Topic {
        uint256 topicId;
        string name;
    }

    struct Band {
        string name; 
        uint256 currentTopicId;
    }

    address private  owner;

    event ExperienceRemoved(uint256 indexed experienceId, uint256 indexed topicId);
    event TopicTextModified(uint256 indexed topicId, string newText);
    mapping(uint256 => uint256[]) public topicToExperiences;
    Experience[] public experiences;
    Topic[] public topics;
    Band[10] public bands; // 10 bands (0-9)

    event ExperienceCreated(uint256 indexed experienceId);
    event TopicCreated(uint256 indexed topicId);
    event BandTopicUpdated(uint256 indexed bandId, uint256 indexed topicId);
    Flip    private _token;

    uint256 private nextTopicId = 0;
    uint256 currentBandPrice = 1 ether;


    modifier onlyOwner {
       require(msg.sender == owner);
       _;
    }



    /**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */
    constructor (){
        owner     =   payable(msg.sender);
        _token  =   Flip(0x544E9675DBA14Cfd286545231007eAe84C4bBF45);
    }    

    function setPayToken(address  addy) external onlyOwner {
        _token = Flip(addy);
    }



    function createExperience(string memory _url, string memory _upc) public {
        // Ensure _upc is not empty
        require(bytes(_upc).length > 0, "UPC cannot be empty");

        // Extract the first character of _upc to determine the band
        require(bytes(_upc).length >= 1, "UPC is too short");
        uint8 bandId = uint8(bytes(_upc)[0]) - uint8(bytes("0")[0]); // Convert ASCII to uint8
        (string memory bandName, uint256 bandTopicId) = getBandTopic(uint256(bandId));

        // Store the topic ID for this experience
        uint256 topicId = bandTopicId;
        experiences.push(Experience(_url, _upc, topicId));

        // Add the experience ID to the topic's list of experiences
        topicToExperiences[topicId].push(experiences.length - 1);

        // Rest of your existing code...

        emit ExperienceCreated(experiences.length - 1);
    }

    function modifyTopicText(uint256 _topicId, string memory _newText) public onlyOwner {
        require(_topicId < topics.length, "Topic does not exist");

        // Update the topic's name
        topics[_topicId].name = _newText;

        // Emit an event to signal that the topic text has been modified
        emit TopicTextModified(_topicId, _newText);
    }


    function unbandit(uint256 _experienceId) public onlyOwner {
        require(_experienceId < experiences.length, "Experience does not exist");

        // Get the experience
        Experience storage experience = experiences[_experienceId];

        // Ensure that this experience is associated with a topic
        require(experience.topicId != 0, "Experience is not associated with a topic");

        // Get the current topic of the band that this experience is associated with
        uint256 currentTopicId = bands[experience.topicId].currentTopicId;

        // Ensure that this experience is associated with the current topic of the band
        require(experience.topicId == currentTopicId, "Experience is not associated with the current topic of the band");

        // Clear the topic ID of the experience
        experience.topicId = 0;

        // Rest of your existing code...

        // Emit an event to signal that the experience has been removed from the band
        emit ExperienceRemoved(_experienceId, currentTopicId);
    }



    function getExperiencesByTopic(uint256 _topicId) public view returns (Experience[] memory) {
        // Ensure the topic exists
        require(_topicId < topics.length, "Topic does not exist");

        // Retrieve the list of experience IDs associated with the given topic ID
        uint256[] memory experienceIds = topicToExperiences[_topicId];
        uint256 count = experienceIds.length;

        // Initialize an array to store the corresponding experiences
        Experience[] memory topicExperiences = new Experience[](count);

        // Fetch the experiences using their IDs
        for (uint256 i = 0; i < count; i++) {
            uint256 experienceId = experienceIds[i];
            topicExperiences[i] = experiences[experienceId];
        }

        return topicExperiences;
    }
    
    function createTopic(string memory _name) public onlyOwner {
        uint256 topicId = nextTopicId;
        nextTopicId++;
        topics.push(Topic(topicId, _name));
        emit TopicCreated(topicId);
    }

    function setBandTopic(uint256 _bandId, uint256 _topicId) public onlyOwner {

        require(_bandId >= 0 && _bandId <= 9, "Invalid band");

        // Verify if the provided topicId exists
        require(_topicId < topics.length, "Topic does not exist");

        // Get the topic name
        string memory topicName = topics[_topicId].name;

        bands[_bandId].currentTopicId = _topicId;
        bands[_bandId].name = topicName; // Set the band's name

        emit BandTopicUpdated(_bandId, _topicId);

    }

    function getExperienceCount() public view returns (uint256) {
        return experiences.length;
    }

    function getExperience(uint256 _experienceId) public view returns (string memory url, string memory upc, uint256 topicId) {
        require(_experienceId < experiences.length, "Experience does not exist");
        Experience memory experience = experiences[_experienceId];
        return (experience.url, experience.upc, experience.topicId);
    }

    function getTopicCount() public view returns (uint256) {
        return topics.length;
    }

    function getTopic(uint256 _topicId) public view returns (uint256 topicId, string memory name) {
        require(_topicId < topics.length, "Topic does not exist");
        Topic memory topic = topics[_topicId];
        return (topic.topicId, topic.name);
    }

    function getBandTopic(uint256 _bandId) public view returns (string memory name, uint256 topicId) {
        require(_bandId >= 0 && _bandId <= 9, "Invalid band");
        Band memory band = bands[_bandId];
        return (band.name, band.currentTopicId);
    }


    function getExperiencesByBand(uint256 _bandId) public view returns (Experience[] memory) {
        require(_bandId >= 0 && _bandId <= 9, "Invalid band");

        Experience[] memory bandExperiences = new Experience[](experiences.length);
        uint256 count = 0;

        for (uint256 i = 0; i < experiences.length; i++) {
            if (experiences[i].topicId == bands[_bandId].currentTopicId) {
                bandExperiences[count] = experiences[i];
                count++;
            }
        }

        // Resize the array to the actual count of matching experiences
        assembly {
            mstore(bandExperiences, count)
        }

        return bandExperiences;
    }

    function getTopics() public view returns (Topic[] memory) {
        return topics;
    }


}
