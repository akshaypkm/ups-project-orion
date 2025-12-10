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
        private IAuthService _authService;

        public AuthenticationController(IAuthService _authService)
        {
            this._authService = _authService;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] UserSignUpDto userSignUpDto)
        {
            
            var res = await _authService.RegisterUserAsync(userSignUpDto);
        
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
            
            var res = await _authService.Login(userLoginDto);

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