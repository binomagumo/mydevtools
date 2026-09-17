using System.Text;

namespace DevToolsetBackend.Services;

public class EncodingService
{
    public string Base64Encode(string value)
    {
        byte[] bytes = Encoding.UTF8.GetBytes(value);

        return Convert.ToBase64String(bytes);
    }

    public string Base64Decode(string value)
    {
        byte[] bytes = Convert.FromBase64String(value);

        return Encoding.UTF8.GetString(bytes);
    }

    public string UrlEncode(string value)
    {
        return Uri.EscapeDataString(value);
    }

    public string UrlDecode(string value)
    {
        return Uri.UnescapeDataString(value);
    }
}