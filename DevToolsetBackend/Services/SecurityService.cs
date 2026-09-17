using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;

namespace DevToolsetBackend.Services;

public class SecurityService
{
    public object DecodeJwt(string token)
    {
        JwtSecurityTokenHandler handler = new();

        JwtSecurityToken jwt = handler.ReadJwtToken(token);

        return new
        {
            header = jwt.Header,
            payload = jwt.Payload,
            issuedAt = jwt.IssuedAt,
            validFrom = jwt.ValidFrom,
            validTo = jwt.ValidTo
        };
    }

    public string Hash(string value, string algorithm)
    {
        byte[] inputBytes = Encoding.UTF8.GetBytes(value);

        byte[] hashBytes = algorithm.ToUpperInvariant() switch
        {
            "SHA256" => SHA256.HashData(inputBytes),
            "SHA384" => SHA384.HashData(inputBytes),
            "SHA512" => SHA512.HashData(inputBytes),
            _ => throw new ArgumentException("Unsupported hash algorithm.")
        };

        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }
}