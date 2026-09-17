using System.ComponentModel.DataAnnotations;

namespace DevToolsetBackend.DTOs;

public class JsonRequest
{
    [Required]
    public string Json { get; set; } = string.Empty;
}