package commonFunctions;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

import org.testng.annotations.*;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
import java.util.concurrent.TimeUnit;

public class CommonFunctions {
	public static WebDriver driver = null;
	
	
	public static Properties properties = null;
	
	public Properties loadPropertyFile() throws IOException {
		FileInputStream fileInputStream = new FileInputStream("config.properties");
		properties = new Properties();
		properties.load(fileInputStream);
		return properties;
	}
	
	@BeforeSuite
	public void launchBrowser() throws IOException {
		loadPropertyFile();
	//	String browser = properties.getProperty("browser");
		String url = properties.getProperty("url");
		String driverLocation = properties.getProperty("DriverLocation");
		
			System.setProperty("webdriver.chrome.driver", driverLocation);
			driver = new ChromeDriver();
		
		driver.manage().window().maximize();
		driver.get(url);
		driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
		
	}
	
	@AfterSuite
	public void tearDown() {
		
	}

}
