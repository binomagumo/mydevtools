using System.ComponentModel.DataAnnotations;

namespace DevToolsetBackend.DTOs;

public class HashRequest
{
    [Required]
    public string Value { get; set; } = string.Empty;

    public string Algorithm { get; set; } = "SHA256";
}