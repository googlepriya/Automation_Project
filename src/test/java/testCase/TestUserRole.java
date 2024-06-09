package testCase;

import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

import commonFunctions.CommonFunctions;
import junit.framework.Assert;
import pageObject.User_Role_Page_Object;

public class TestUserRole extends CommonFunctions{
	
	public void moveToUsersPage() {
		User_Role_Page_Object.adminLink.click();
		User_Role_Page_Object.userManagementLink.click();
		User_Role_Page_Object.usersLink.click();
	}
	
	public void selectUserRole() {
		Select selectRole = new Select(User_Role_Page_Object.userRole);
		selectRole.selectByIndex(0);
	}
	
	public void selectUserStatus() {
		
		Select selectStatus = new Select(User_Role_Page_Object.status);
		selectStatus.selectByIndex(0);
	}
	
	@Test
	public void checkUserRole() {
		PageFactory.initElements(driver, User_Role_Page_Object.class);
		moveToUsersPage();
		selectUserRole();
		selectUserStatus();
		User_Role_Page_Object.submitButton.click();
		String acutualRole = User_Role_Page_Object.userRoleValue.getText();
		String actualStatus = User_Role_Page_Object.userRoleStatus.getText();
	    
	    Assert.assertEquals(acutualRole, "Admin");
	    Assert.assertEquals(actualStatus, "Enabled");
		
		
		
		
		
	}
}
