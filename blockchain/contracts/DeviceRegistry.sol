// contracts/DeviceRegistry.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DeviceRegistry {
    mapping(bytes32 => Registration) public registrations;

    struct Registration {
        bytes32 hashedDID;
        bytes userSignature;
        bytes systemSignature;
        address registeredBy;
        uint256 timestamp;
    }

    event DeviceRegistered(bytes32 indexed hashedDeviceId, bytes32 hashedDID, address indexed registeredBy);

    function registerDevice(
        bytes32 hashedDeviceId,
        bytes32 hashedDID,
        bytes memory userSignature,
        bytes memory systemSignature
    ) public {
        require(registrations[hashedDeviceId].hashedDID == bytes32(0), "Device already registered");

        registrations[hashedDeviceId] = Registration({
            hashedDID: hashedDID,
            userSignature: userSignature,
            systemSignature: systemSignature,
            registeredBy: msg.sender,
            timestamp: block.timestamp
        });

        emit DeviceRegistered(hashedDeviceId, hashedDID, msg.sender);
    }


    function getRegistration(bytes32 hashedDeviceId)
        public
        view
        returns (
            bytes32 hashedDID,
            bytes memory userSignature,
            bytes memory systemSignature,
            address registeredBy,
            uint256 timestamp
        )
    {
        Registration memory reg = registrations[hashedDeviceId];
        return (reg.hashedDID, reg.userSignature, reg.systemSignature, reg.registeredBy, reg.timestamp);
    }

    
}
