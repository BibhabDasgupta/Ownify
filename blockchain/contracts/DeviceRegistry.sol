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
        bool isRevoked;
    }

    event DeviceRegistered(bytes32 indexed hashedDeviceId, bytes32 hashedDID, address indexed registeredBy);
    event DeviceRevoked(bytes32 indexed hashedDeviceId, address indexed registeredBy);
    event DeviceRevocationRemoved(bytes32 indexed hashedDeviceId, address indexed registeredBy);

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
            timestamp: block.timestamp,
            isRevoked: false
        });

        emit DeviceRegistered(hashedDeviceId, hashedDID, msg.sender);
    }

    function revokeDevice(bytes32 hashedDeviceId) public {
        Registration storage reg = registrations[hashedDeviceId];
        require(reg.hashedDID != bytes32(0), "Device not registered");
        require(reg.registeredBy == msg.sender, "Only owner can revoke");
        require(!reg.isRevoked, "Device already revoked");

        reg.isRevoked = true;
        emit DeviceRevoked(hashedDeviceId, msg.sender);
    }

    function removeRevocation(bytes32 hashedDeviceId) public {
        Registration storage reg = registrations[hashedDeviceId];
        require(reg.hashedDID != bytes32(0), "Device not registered");
        require(reg.registeredBy == msg.sender, "Only owner can remove revocation");
        require(reg.isRevoked, "Device not revoked");

        reg.isRevoked = false;
        emit DeviceRevocationRemoved(hashedDeviceId, msg.sender);
    }


    function getRegistration(bytes32 hashedDeviceId)
        public
        view
        returns (
            bytes32 hashedDID,
            bytes memory userSignature,
            bytes memory systemSignature,
            address registeredBy,
            uint256 timestamp,
            bool isRevoked
        )
    {
        Registration memory reg = registrations[hashedDeviceId];
        return (reg.hashedDID, reg.userSignature, reg.systemSignature, reg.registeredBy, reg.timestamp, reg.isRevoked);
    }

    
}
