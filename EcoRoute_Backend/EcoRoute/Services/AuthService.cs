using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EcoRoute.Data;
using EcoRoute.Models;
using EcoRoute.Models.Entities;
using EcoRoute.Repositories;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace EcoRoute.Services
{
    public interface IAuthService
    {
        Task<(bool Success, string Message)> RegisterUserAsync(UserSignUpDto userSignUpDto);

        Task<(bool Success, string Message, string? Token, string? Role, string? CompanyName)> Login(UserLoginDto userLoginDto);
    }
    public class AuthService : IAuthService
    {
        private readonly EcoRouteDbContext _dbContext;
        private readonly IUserRepository _userRepo;

        private readonly ICompanyRepository _companyRepo;

        private readonly IConfiguration _configuration;
        
        public AuthService(EcoRouteDbContext _dbContext, IUserRepository _userRepo, 
                            ICompanyRepository _companyRepo, IConfiguration _configuration)
        {
            this._dbContext = _dbContext;
            this._userRepo = _userRepo;
            this._companyRepo = _companyRepo;
            this._configuration = _configuration;
            
        }
        public async Task<(bool Success, string Message)> RegisterUserAsync(UserSignUpDto userSignUpDto)
        {
            if(await _userRepo.UserExistsAsync(userSignUpDto.UserId))
            {
                return (false, "User ID already taken!");
            }

            if(userSignUpDto.Role.ToLower() == "admin" && await _companyRepo.CompanyExistsByNameAsync(userSignUpDto.CompanyName))
            {
                return (false, $"Admin account is already created for the company : {userSignUpDto.CompanyName}");
            }

            using var transaction = await _dbContext.Database.BeginTransactionAsync();

            try{            
                var user = new User
                {
                    UserId = userSignUpDto.UserId,
                    CompanyName = userSignUpDto.CompanyName,
                    Email = userSignUpDto.Email,
                    Role = userSignUpDto.Role,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(userSignUpDto.Password)
                };
                
                if(!await _companyRepo.CompanyExistsByNameAsync(userSignUpDto.CompanyName))
                {
                    var company = new Company
                    {
                        CompanyName = userSignUpDto.CompanyName,
                        CompanySector = userSignUpDto.CompanySector,
                        CompanyCredits = CalculateCompanyCredits(userSignUpDto.CompanySector)
                    };

                    await _companyRepo.AddCompanyAsync(company);
                    await _companyRepo.SaveChangesAsync();
                }
                
                
                await _userRepo.AddUserAsync(user);
                await _userRepo.SaveChangesAsync();
                
                await transaction.CommitAsync();
            

            return (true, "user registered successfully");
            }
            catch(Exception e)
            {
                await transaction.RollbackAsync();
                return (false, "User registration failed, please do try again");
            }
        }
        private double CalculateCompanyCredits(string companySector)
        {   
            if(companySector == null)
            {
                return 0.0;
            }

            double companyCredits;
            switch (companySector.ToLower())
            {
                case "iron and steel":
                    companyCredits =100;
                    break;
                case "":
                default:
                    companyCredits = 0.0;
                    break;
            }

            return companyCredits;
        }    

        public async Task<(bool Success, string Message, string? Token, 
        string? Role, string? CompanyName)> Login(UserLoginDto userLoginDto)
        {
            if(!await _userRepo.UserExistsAsync(userLoginDto.UserId))
            {
                return (false, "User Id does not exists",null, null, null);
            }

            var user = await _userRepo.GetUserByIdAsync(userLoginDto.UserId);

            if(!BCrypt.Net.BCrypt.Verify(userLoginDto.Password, user.PasswordHash))
            {
                return (false, "Password is incorrect", null, null, null);
            }

            string token = CreateToken(user);

            return (true, "Login success", token, user.Role, user.CompanyName);
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserId),
                new Claim("role", user.Role),
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
    }
}