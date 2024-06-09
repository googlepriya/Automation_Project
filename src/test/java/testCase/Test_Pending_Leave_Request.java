package testCase;

import org.openqa.selenium.support.PageFactory;
import org.testng.Assert;
import org.testng.annotations.Test;
import commonFunctions.CommonFunctions;
import pageObject.Dashboard_Page_object;
import pageObject.Login_Page_Object;

public class Test_Pending_Leave_Request extends CommonFunctions{
	
	String actualMessage = null;
	
	public void login() {
		
		PageFactory.initElements(driver, Login_Page_Object.class);
		Login_Page_Object.username.sendKeys(properties.getProperty("username"));
		Login_Page_Object.password.sendKeys(properties.getProperty("password"));
		Login_Page_Object.submitButton.click();
	}
	
	public void getPendingLeaveRequest() {
		
		PageFactory.initElements(driver, Dashboard_Page_object.class);
		actualMessage = Dashboard_Page_object.pendingLeaveRequest.getText();
	}
	
	@Test
	public void verifyPendingLeaveRequest() {

		login();
		getPendingLeaveRequest();
		Assert.assertEquals(actualMessage, "No Employees are on Leave Today");
	}

}
