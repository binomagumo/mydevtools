using System.ComponentModel.DataAnnotations;

namespace DevToolsetBackend.DTOs;

public class EncodingRequest
{
    [Required]
    public string Value { get; set; } = string.Empty;
}