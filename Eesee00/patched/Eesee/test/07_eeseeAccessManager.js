const assert = require("assert");
const { expect } = require("chai");
describe("eeseeAccessManager", function () {
    let accessManager
    let signer
    let acc2
    this.beforeAll(async() => {
        [signer, acc2] = await ethers.getSigners()
        const _eeseeAccessManager = await hre.ethers.getContractFactory("EeseeAccessManager");
        accessManager =  await _eeseeAccessManager.deploy()
        await accessManager.deployed()
    })
    const _role = '0x0000000000000000000000000000000000000000000000000000000000000000'
    it('Admin Role', async () => {
        assert.equal(
            await accessManager.ADMIN_ROLE(),
            _role,
            'ADMIN_ROLE is not 0x00'
        )

        assert.equal(
            await accessManager.hasRole(_role, signer.address),
            true,
            "Admin role wasn't set"
        )
    })
    const role = '0x0000000000000000000000000000000000000000000000000000000000000001'
    const account = '0x0000000000000000000000000000000000000000'
    it('Grants Role', async () => {
        await expect(accessManager.connect(acc2).grantRole(role, account))
        .to.be.revertedWithCustomError(accessManager, "CallerNotAdmin")


        await expect(accessManager.grantRole(role, account))
        .to.emit(accessManager, "RoleGranted")
        .withArgs(role, account)

        assert.equal(
            await accessManager.hasRole(role, account),
            true,
            "Role wasn't granted"
        )

        
        await accessManager.grantRole(role, account)
        assert.equal(
            await accessManager.hasRole(role, account),
            true,
            'Role removed'
        )
    })
    it('Revokes Role', async () => {
        await expect(accessManager.connect(acc2).revokeRole(role, account))
        .to.be.revertedWithCustomError(accessManager, "CallerNotAdmin")


        await expect(accessManager.revokeRole(role, account))
        .to.emit(accessManager, "RoleRevoked")
        .withArgs(role, account)

        assert.equal(
            await accessManager.hasRole(role, account),
            false,
            "Role wasn't granted"
        )


        await accessManager.revokeRole(role, account)
        assert.equal(
            await accessManager.hasRole(role, account),
            false,
            'Role granted'
        )
    })
})
