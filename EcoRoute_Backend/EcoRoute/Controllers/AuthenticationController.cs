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
using EcoRoute.Repositories;
using EcoRoute.Services;

namespace EcoRoute.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly EcoRouteDbContext dbContext;
        private readonly IConfiguration _configuration;

        private IUserRepository _userRepo;
        private ICompanyRepository _companyRepo;

        private IUserService _userService;

        public AuthenticationController(EcoRouteDbContext dbContext,
                                        IConfiguration _configuration, IUserRepository _userRepo
                                        ,ICompanyRepository _companyRepo
                                        ,IUserService _userService)
        {
            this.dbContext = dbContext;
            this._configuration = _configuration;
            this._userRepo = _userRepo;
            this._companyRepo = _companyRepo;
            this._userService = _userService;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] UserSignUpDto userSignUpDto)
        {
            
            var res = await _userService.RegisterUserAsync(userSignUpDto);
        
            bool resBool = res.Success;
            string resMessge = res.Message;

            if (!resBool)
            {
                return BadRequest(resMessge);
            }

            return Ok(resMessge);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto userLoginDto)
        {
            
            var res = await _userService.Login(userLoginDto);

            if (!res.Success)
            {
                return BadRequest(res.Message);    
            }
            
            return Ok(new
            {
                res.Token,
                res.Role,
                res.CompanyName
            });
        }
    }
}