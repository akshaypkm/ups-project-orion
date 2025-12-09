using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcoRoute.Data; // Your DbContext namespace
using EcoRoute.Models;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.AspNetCore.Identity.Data;
using EcoRoute.Models.Entities;

namespace EcoRoute.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly EcoRouteDbContext dbContext;
        private readonly IConfiguration _configuration;

        public AuthenticationController(EcoRouteDbContext dbContext,
                                        IConfiguration _configuration)
        {
            this.dbContext = dbContext;
            this._configuration = _configuration;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] UserSignUpDto userSignUpDto)
        {
            if(await dbContext.Users.AnyAsync(u => u.UserId == userSignUpDto.UserId))
            {
                return BadRequest("User ID already exists!");
            }

            if(userSignUpDto.Role.ToLower() == "admin" && await dbContext.Companies.AnyAsync(c => c.CompanyName == userSignUpDto.CompanyName))
            {
                return BadRequest($"Admin account is already created for the company : {userSignUpDto.CompanyName}");
            }
            
            var user = new User
            {
                UserId = userSignUpDto.UserId,
                CompanyName = userSignUpDto.CompanyName,
                Email = userSignUpDto.Email,
                Role = userSignUpDto.Role,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(userSignUpDto.Password)
            };
            
            if(!await dbContext.Companies.AnyAsync(c => c.CompanyName == userSignUpDto.CompanyName))
            {
                var company = new Company
                {
                    CompanyName = userSignUpDto.CompanyName,
                    CompanySector = userSignUpDto.CompanySector,
                    CompanyCredits = CalculateCompanyCredits(userSignUpDto.CompanySector)
                };

                await dbContext.Companies.AddAsync(company);
                await dbContext.SaveChangesAsync();
            }
            
            
            await dbContext.Users.AddAsync(user);
            await dbContext.SaveChangesAsync();
            
            return Ok(new
            {
                message = "User registered successfully!"
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto userLoginDto)
        {
            
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.UserId == userLoginDto.UserId);

            if(user == null || !BCrypt.Net.BCrypt.Verify(userLoginDto.Password, user.PasswordHash)){
                return Unauthorized("Invalid User Id or Password");
            }

            string token = CreateToken(user);
            
            return Ok(new
            {
                token,
                role = user.Role,
                company = user.CompanyName
            });

        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserId),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("CompanyName", user.CompanyName)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("AppSettings:Token").Value!
            ));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private double CalculateCompanyCredits(string companySector)
        {   
            if(companySector == null)
            {
                return 0.0;
            }

            double companyCredits;
            switch (companySector)
            {
                case "Agriculture":
                    companyCredits = 1090.00;
                    break;
                // more cases to add!
                default:
                    companyCredits = 0.0;
                    break;
            }

            return companyCredits;
        }
    }
}